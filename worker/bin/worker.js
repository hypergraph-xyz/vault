#!/usr/bin/env node
'use strict'
process.title = 'worker'

const Worker = require('..')

const {
  VAULT_URL: vaultUrl = 'http://localhost:8080',
  PORT: port = 1000
} = process.env

const main = async () => {
  const worker = new Worker({ vaultUrl, port })
  await worker.start()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
