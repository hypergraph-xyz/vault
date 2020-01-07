'use strict'

const stripe = require('stripe')('sk_test_w2QavCvblOXzADndimzfhC7I00Wyxy5JJv')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')

const { WEBHOOK_SECRET: webhookSecret } = process.env

const handler = async (req, res) => {
  const { get, post } = routes(req)

  if (get('/health')) {
    res.end('OK')
  } else if (post('/stripe')) {
    const body = await promisify(textBody)(req, res)
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log('stripe', event)
    res.end(JSON.stringify({ received: true }))
  }
}

module.exports = http(handler)
