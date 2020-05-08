# Benchmarking Rust vs Node

A very simple TCP throughput benchmark.
* Process opens a TCP server that echos back
* In each benchmark iteration, a TCP client connects to the server, sends `1000` times a `1KB` buffer, and waits to read back `1000KB` of data.

**Node is ~10times faster than Rust. Where is the error in this benchmark, or what is the cause for this?**

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
tcp-throughput/tcp echo 
time:   [29.705 ms 33.506 ms 36.971 ms]
thrpt:  [25.795 MiB/s 28.463 MiB/s 32.105 MiB/s]

```
