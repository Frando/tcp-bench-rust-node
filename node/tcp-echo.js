const net = require('net')
const pretty = require('pretty-bytes')
const assert = require('assert').strict

const SIZE = 1000
const COUNT = 1000
const ITERS = 1000

const PORT = 12345

const server = net.createServer(socket => {
  socket.pipe(socket)
})
server.listen(PORT, onlisten)

function onlisten () {
  const timer = clock()
  let i = 0
  const stats = { max: 0, min: Infinity, total: 0 }
  echobench(next)
  function next (err, time) {
    if (err) return done(err)
    stats.max = Math.max(stats.max, time)
    stats.min = Math.min(stats.min, time)
    stats.total += time
    if (i === ITERS) return done()
    i++
    process.nextTick(echobench, next)
  }

  function done (err) {
    if (err) return console.error(err)
    console.log(`finish ${i} iterations, each ${COUNT} * ${pretty(SIZE)}`)
    console.log(`min ${formatTime(stats.min)} mean ${formatTime(stats.total / i)} max ${formatTime(stats.max)}`)
    console.log(`total ${formatTime(timer(), SIZE * COUNT * i)}`)
    process.exit(0)
  }
}

function echobench (cb) {
  const timer = clock()
  const socket = net.connect(PORT)
  const data = Buffer.alloc(SIZE, 1)
  const resultbuf = Buffer.alloc(SIZE * COUNT, 0)
  let offset = 0
  let i = 0
  socket.on('data', ondata)
  write()
  function ondata (buf) {
    buf.copy(resultbuf, offset)
    offset += buf.length

    if (offset >= COUNT * SIZE) {
      if (!resultbuf[0] === 1) return cb(Error('invalid data'))
      if (!resultbuf[offset] === 1) return cb(new Error('invalid data'))
      cb(null, timer())
    }
  }
  function write () {
    socket.write(data)
    if (++i < COUNT) process.nextTick(write)
  }
}

function clock () {
  const [ss, sn] = process.hrtime()
  return () => {
    const [ds, dn] = process.hrtime([ss, sn])
    const ns = (ds * 1e9) + dn
    return ns
  }
}

function formatTime (ns, bytes) {
  const ms = round(ns / 1e6)
  const s = round(ms / 1e3)
  let time
  if (s >= 1) time = s + 's'
  else if (ms >= 0.01) time = ms + 'ms'
  else if (ns) time = ns + 'ns'
  if (!bytes) return time
  const bytespers = pretty(bytes / (ns / 1e9))
  return `${time} ${bytespers}/s`
}

function round (num, decimals = 2) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
