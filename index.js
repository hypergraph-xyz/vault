'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')
const { json } = require('./lib/http-respond')
const { Pool } = require('pg')
const { promises: fs } = require('fs')
const { parse } = require('querystring')
const Mailgun = require('mailgun-js')

const {
  WEBHOOK_SECRET: webhookSecret,
  STRIPE_SECRET_KEY: stripeSecretKey = 'sk_test_w2QavCvblOXzADndimzfhC7I00Wyxy5JJv',
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain
} = process.env

const stripe = createStripe(stripeSecretKey)
const pool = new Pool()
const mailgun = new Mailgun({
  apiKey: mailgunApiKey,
  domain: mailgunDomain
})

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
    res.end(await fs.readFile(`${__dirname}/views/home.html`))
  } else if (get('/sign-up')) {
    res.end(await fs.readFile(`${__dirname}/views/sign-up.html`))
  } else if (get('/sign-in')) {
    res.end(await fs.readFile(`${__dirname}/views/sign-in.html`))
  } else if (post('/sign-up') || post('/sign-in')) {
    const body = await promisify(textBody)(req, res)
    const { email } = parse(body)
    await mailgun.messages().send({
      from: 'no-reply@vaul.hypergraph.xyz',
      to: email,
      subject: 'Vault',
      text: 'Test'
    })
    res.end(email)
  } else if (get('/modules')) {
    const { rows } = await pool.query('SELECT * FROM modules')
    json(res, rows)
  }
}

module.exports = http(handler)
