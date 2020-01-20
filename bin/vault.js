#!/usr/bin/env node
'use strict'
process.title = 'vault'
require('dotenv').config()

const handler = require('..')
const http = require('http')
const { default: migrate } = require('node-pg-migrate')

const { PORT: port = 8080 } = process.env

const main = async () => {
  await migrate({
    dir: `${__dirname}/../migrations`,
    direction: 'up'
  })

  const server = http.createServer(handler)
  server.listen(port)
  console.log('http://localhost:8080')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
