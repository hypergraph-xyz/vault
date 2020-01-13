'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')
const { json } = require('./lib/http-respond')
const { Pool } = require('pg')

const {
  WEBHOOK_SECRET: webhookSecret,
  STRIPE_SECRET_KEY: stripeSecretKey = 'sk_test_w2QavCvblOXzADndimzfhC7I00Wyxy5JJv'
} = process.env

const stripe = createStripe(stripeSecretKey)
const pool = new Pool()

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
  } else if (get('/now')) {
    const { rows } = await pool.query('SELECT NOW()')
    res.end(String(rows[0].now))
  } else if (get('/')) {
    res.end('Home!')
  }
}

module.exports = http(handler)
