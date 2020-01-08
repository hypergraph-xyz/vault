#!/usr/bin/env node
'use strict'
process.title = 'vault'

const handler = require('..')
const http = require('http')

const { PORT: port = 8080 } = process.env

const server = http.createServer(handler)
server.listen(port)
console.log('http://localhost:8080')
