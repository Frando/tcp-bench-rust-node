use async_std::net::{TcpListener, TcpStream};
use async_std::task;
use criterion::{criterion_group, criterion_main, Criterion, Throughput};
use futures::io::{AsyncReadExt, AsyncWriteExt};
use futures::stream::StreamExt;

const SIZE: u64 = 1000;
const COUNT: u64 = 1000;

fn bench_throughput(c: &mut Criterion) {
    env_logger::from_env(env_logger::Env::default().default_filter_or("error")).init();
    let address = "localhost:11011";

    let _server = task::block_on(async {
        let listener = TcpListener::bind(&address).await.unwrap();
        task::spawn(async move {
            let mut incoming = listener.incoming();
            while let Some(Ok(mut stream)) = incoming.next().await {
                let clone = stream.clone();
                task::spawn(async move {
                    futures::io::copy(clone, &mut stream).await.unwrap();
                });
            }
        });
    });

    let mut group = c.benchmark_group("tcp-throughput");
    group.sample_size(10);
    group.throughput(Throughput::Bytes(SIZE * COUNT));
    group.bench_function("tcp echo one task", |b| {
        b.iter(|| {
            task::block_on(async move {
                let mut stream = TcpStream::connect(&address).await.unwrap();
                let data = vec![1u8; SIZE as usize];
                let mut stream_clone = stream.clone();
                for _i in 0..COUNT {
                    stream_clone.write_all(&data).await.unwrap();
                    stream_clone.flush().await.unwrap();
                }
                let mut buf = vec![0u8; (SIZE * COUNT) as usize];
                stream.read_exact(&mut buf).await.unwrap();
            })
        })
    });
    group.bench_function("tcp echo two tasks", |b| {
        b.iter(|| {
            task::block_on(async move {
                let mut stream = TcpStream::connect(&address).await.unwrap();
                let data = vec![1u8; SIZE as usize];
                let mut stream_clone = stream.clone();
                let writer = task::spawn(async move {
                    for _i in 0..COUNT {
                        stream_clone.write_all(&data).await.unwrap();
                        stream_clone.flush().await.unwrap();
                    }
                });
                let reader = task::spawn(async move {
                    let mut buf = vec![0u8; (SIZE * COUNT) as usize];
                    stream.read_exact(&mut buf).await.unwrap();
                });
                futures::future::join_all(vec![reader, writer]).await;
            })
        })
    });
    group.finish();
}

criterion_group!(server_benches, bench_throughput);
criterion_main!(server_benches);
