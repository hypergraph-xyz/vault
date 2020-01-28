'use strict'

const fetch = require('node-fetch')
const hyperdrive = require('@geut/hyperdrive-promise')
const ram = require('random-access-memory')
const hyperswarm = require('hyperswarm')
const { toBuf, toStr } = require('dat-encoding')
const { promisify } = require('util')
const { pipeline } = require('stream')
const http = require('http')
const { json } = require('http-responders')

class Worker {
  constructor ({ vaultUrl, swarmPort, httpPort }) {
    this.vaultUrl = vaultUrl
    this.swarmPort = swarmPort
    this.httpPort = httpPort
  }

  async startHttp () {
    const server = http.createServer((req, res) => {
      json(res, { uptime: process.uptime() })
    })
    await promisify(server.listen.bind(server))(this.httpPort)
    console.log(`http://localhost:${this.httpPort}`)
    await new Promise(() => {})
  }

  async startSwarm () {
    const drives = new Map()

    const swarm = hyperswarm({ queue: { multiplex: true } })
    swarm.on('error', console.error)
    swarm.on('connection', (socket, info) => {
      socket.setMaxListeners(Infinity)
      for (const topic of info.topics) {
        const drive = drives.get(toStr(topic))
        if (drive) {
          const isInitiator = info.client
          pipeline(
            socket,
            drive.replicate(isInitiator, { timeout: 0 }),
            socket,
            err => err && console.error(err)
          )
          console.log('replicate', toStr(topic))
        }
      }
    })
    await promisify(swarm.listen.bind(swarm))(this.port)

    const res = await fetch(`${this.vaultUrl}/api/modules`)
    const modules = await res.json()

    for (const { url } of modules) {
      const key = toBuf(url)
      const drive = hyperdrive(ram, key)
      await promisify(drive.once.bind(drive))('ready')
      drives.set(toStr(drive.discoveryKey), drive)
      console.log('join', toStr(drive.discoveryKey))
      swarm.join(drive.discoveryKey, { announce: true, lookup: true })
    }

    await new Promise(() => {})
  }

  async start () {
    await Promise.race([this.startHttp(), this.startSwarm()])
  }
}

module.exports = Worker
