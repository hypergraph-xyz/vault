'use strict'

const http = require('http')
const createWebhookEndpoint = require('./lib/webhook-endpoint')

const createServer = async () => {
  // const endpoint =
  await createWebhookEndpoint()

  const server = http.createServer((req, res) => {
    res.end('HI')
  })

  return server
}

module.exports = createServer
