'use strict'

const stripe = require('stripe')('sk_test_w2QavCvblOXzADndimzfhC7I00Wyxy5JJv')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')
const { json } = require('./lib/http-respond')

const { WEBHOOK_SECRET: webhookSecret } = process.env

const handler = async (req, res) => {
  const { get, post } = routes(req)

  if (get('/health')) {
    json(res, {
      uptime: process.uptime()
    })
  } else if (post('/stripe')) {
    const body = await promisify(textBody)(req, res)
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log('stripe', event)
    json(res, { received: true })
  }
}

module.exports = http(handler)
