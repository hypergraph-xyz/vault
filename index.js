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
const { randomBytes } = require('crypto')
const emails = require('./lib/emails')

const {
  STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
  STRIPE_SECRET_KEY: stripeSecretKey = 'sk_test_w2QavCvblOXzADndimzfhC7I00Wyxy5JJv',
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain = 'smtp.hypergraph.xyz',
  MAILGUN_HOST: mailgunHost = 'api.eu.mailgun.net',
  VAULT_URL: vaultUrl = 'http://localhost:8080'
} = process.env

const stripe = createStripe(stripeSecretKey)
const pool = new Pool()
const mailgun = new Mailgun({
  apiKey: mailgunApiKey,
  domain: mailgunDomain,
  host: mailgunHost
})

const handler = async (req, res) => {
  const { get, post } = routes(req)

  if (get('/health')) {
    json(res, {
      uptime: process.uptime()
    })
  } else if (post('/stripe')) {
    const body = await promisify(textBody)(req, res, { encoding: undefined })
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret)
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
    const { email: to } = parse(body)
    const token = (await promisify(randomBytes)(48)).toString('hex')
    await pool.query('INSERT INTO sign_in_tokens (value) VALUES ($1)', [token])

    const link = `${vaultUrl}/sign-in-token?token=${token}`
    const email = req.url === '/sign-up' ? emails.signUp : emails.signIn

    await mailgun.messages().send({
      ...email(link),
      from: 'Hypergraph <support@hypergraph.xyz>',
      to
    })
    res.end('Please check your email.')
  } else if (get('/sign-in-token')) {
    const token = new URL(req.url, vaultUrl).searchParams.get('token')
    // TODO: check age <= 24h
    const { rows } = await pool.query(
      'SELECT * FROM sign_in_tokens WHERE value = $1',
      [token]
    )
    // TODO: atomic
    await pool.query('DELETE FROM sign_in_tokens WHERE value = $1', [token])
    // TODO: if the user doesn't yet exist, create them
    if (rows.length === 1) {
      res.end('Now you would be signed in!')
    }
  } else if (get('/modules')) {
    const { rows } = await pool.query('SELECT * FROM modules')
    json(res, rows)
  }
}

module.exports = http(handler)
