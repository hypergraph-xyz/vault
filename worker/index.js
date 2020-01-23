'use strict'

const fetch = require('node-fetch')

class Worker {
  constructor ({ vaultUrl }) {
    this.vaultUrl = vaultUrl
  }

  async start () {
    const res = await fetch(`${this.vaultUrl}/api/modules`)
    const modules = await res.json()
    console.log({ modules })
  }
}

module.exports = Worker
