'use strict'

const stripe = require('stripe')('TODO_STRIPE_ID')
const anyBody = require('body/any')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')

const { WEBHOOK_SECRET: webhookSecret } = process.env

const handler = async (req, res) => {
  const { post } = routes(req)

  if (post('/stripe')) {
    const body = await promisify(anyBody)(req, res)
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log('stripe', event)
    res.end(JSON.stringify({ received: true }))
  }
}

module.exports = http(handler)
