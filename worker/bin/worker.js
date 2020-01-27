#!/usr/bin/env node
'use strict'
process.title = 'worker'

const Worker = require('..')

const {
  VAULT_URL: vaultUrl = 'http://localhost:8080',
  SWARM_PORT: swarmPort = 1000,
  HTTP_PORT: httpPort = 3000
} = process.env

const main = async () => {
  const worker = new Worker({ vaultUrl, swarmPort, httpPort })
  await worker.start()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
