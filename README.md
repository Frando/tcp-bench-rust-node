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
time:   [1.8432 ms 2.0132 ms 2.1089 ms]
thrpt:  [452.22 MiB/s 473.70 MiB/s 517.39 MiB/s]

tcp-throughput/tcp echo two tasks: 
time:   [30.108 ms 31.681 ms 33.023 ms]
thrpt:  [28.879 MiB/s 30.103 MiB/s 31.675 MiB/s]

```

