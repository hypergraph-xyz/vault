#!/usr/bin/env node
'use strict'
process.title = 'vault'

const handler = require('..')
const http = require('http')

const server = http.createServer(handler)
server.listen(8080)
console.log('http://localhost:8080')
