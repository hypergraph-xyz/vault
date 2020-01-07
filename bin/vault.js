#!/usr/bin/env node
'use strict'
process.title = 'vault'

const createServer = require('..')

const main = async () => {
  const server = await createServer()
  server.listen(8080)
  console.log('http://localhost:8080')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
