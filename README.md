# Benchmarking Rust vs Node

A very simple TCP throughput benchmark.
* Process opens a TCP server that echos back
* In each benchmark iteration, a TCP client connects to the server, sends `1000` times a `1KB` buffer, and waits to read back `1000KB` of data.


## Node

```bash
cd node
npm install
node tcp-echo.js
```

Results:
```
finish 100 iterations, each 1000 * 1 kB
min 1.38ms mean 3.96ms max 65.36ms
total 397.91ms 251 MB/s
```

## Rust

```bash
cd rust
cargo bench
```

Results:
```
tcp-throughput/tcp echo one task
time:   [4.4704 ms 4.8945 ms 5.2389 ms]
thrpt:  [182.04 MiB/s 194.84 MiB/s 213.33 MiB/s]

tcp-throughput/tcp echo two tasks
time:   [29.548 ms 33.711 ms 37.936 ms]
thrpt:  [25.139 MiB/s 28.289 MiB/s 32.275 MiB/s]


```

