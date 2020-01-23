'use strict'

const fetch = require('node-fetch')
const P2PCommons = require('@p2pcommons/sdk-js')

class Worker {
  constructor ({ vaultUrl }) {
    this.vaultUrl = vaultUrl
    this.p2p = new P2PCommons()
    this.ready = this.p2p.ready()
  }

  async start () {
    await this.ready
    const res = await fetch(`${this.vaultUrl}/api/modules`)
    const modules = await res.json()
    console.log({ modules })
  }
}

module.exports = Worker
