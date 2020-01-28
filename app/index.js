'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')
const { json, redirect } = require('http-responders')
const cookie = require('./lib/http-cookie')
const createView = require('./lib/http-view')
const { Pool } = require('pg')
const { parse } = require('querystring')
const Mailgun = require('mailgun-js')
const emails = require('./lib/emails')
const createBranca = require('branca')

const {
  STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
  STRIPE_SECRET_KEY: stripeSecretKey,
  MAILGUN_API_KEY: mailgunApiKey,
  MAILGUN_DOMAIN: mailgunDomain = 'smtp.hypergraph.xyz',
  MAILGUN_HOST: mailgunHost = 'api.eu.mailgun.net',
  VAULT_URL: vaultUrl = 'http://localhost:8080',
  BRANCA_KEY: brancaKey
} = process.env

const stripe = createStripe(stripeSecretKey)
const branca = createBranca(brancaKey)
const pool = new Pool()
const mailgun = new Mailgun({
  apiKey: mailgunApiKey,
  domain: mailgunDomain,
  host: mailgunHost
})

const handler = async (req, res) => {
  const { get, post } = routes(req)
  const token = cookie.get(req, 'token')
  let session
  if (token) {
    try {
      session = branca.decode(token).toString()
    } catch (_) {}
  }
  const view = createView({ session })

  if (get('/health')) {
    let dbTime
    try {
      const { rows } = await pool.query('SELECT NOW()')
      dbTime = String(rows[0].now)
    } catch (err) {
      console.error(err)
    }
    json(res, {
      uptime: process.uptime(),
      dbTime
    })
  } else if (post('/stripe')) {
    const body = await promisify(textBody)(req, res, { encoding: undefined })
    const sig = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret)
    console.log('stripe', event)
    json(res, { received: true })
  } else if (get('/')) {
    res.end(await view('home'))
  } else if (get('/sign-up')) {
    res.end(await view('sign-up'))
  } else if (get('/sign-in')) {
    res.end(await view('sign-in'))
  } else if (post('/sign-up') || post('/sign-in')) {
    const body = await promisify(textBody)(req, res)
    const { email: to } = parse(body)
    const token = branca.encode(to)
    await pool.query('INSERT INTO sign_in_tokens (value) VALUES ($1)', [token])

    const link = `${vaultUrl}/create-session?token=${token}`
    const email = req.url === '/sign-up' ? emails.signUp : emails.signIn

    await mailgun.messages().send({
      ...email(link),
      from: 'Hypergraph <support@hypergraph.xyz>',
      to
    })
    res.end(await view('check-email'))
  } else if (get('/create-session')) {
    const token = new URL(req.url, vaultUrl).searchParams.get('token')
    const query = `
      DELETE FROM sign_in_tokens
      WHERE value = $1
      AND created_at >= NOW() - '1 day'::interval
    `
    const { rowCount } = await pool.query(query, [token])

    if (rowCount === 1) {
      cookie.set(res, 'token', token)
      redirect(req, res, '/')
    }

    const cleanup = `
      DELETE FROM sign_in_tokens
      WHERE created_at < NOW() - '1 day'::interval
    `
    pool.query(cleanup).catch(console.error)
  } else if (get('/sign-out')) {
    cookie.unset(res, 'token')
    redirect(req, res, '/')
  } else if (get('/modules')) {
    const { rows: modules } = await pool.query('SELECT * FROM modules')
    res.end(
      await view('modules', { modules: JSON.stringify(modules, null, 2) })
    )
  } else if (get('/api/modules')) {
    const { rows: modules } = await pool.query('SELECT * FROM modules')
    json(res, modules)
  }
}

module.exports = http(handler)
