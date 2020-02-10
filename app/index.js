'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const jsonBody = require('body/json')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const routes = require('./lib/http-routes')
const { json, redirect } = require('http-responders')
const createView = require('./lib/http-view')
const { Pool } = require('pg')
const { parse } = require('querystring')
const Mailgun = require('mailgun-js')
const emails = require('./lib/emails')
const config = require('./lib/config')
const assert = require('http-assert')
const Session = require('./lib/session')

const stripe = createStripe(config.stripeSecretKey)
const pool = new Pool()
const mailgun = new Mailgun({
  apiKey: config.mailgunApiKey,
  domain: config.mailgunDomain,
  host: config.mailgunHost
})

const handler = async (req, res) => {
  const { get, post } = routes(req)
  const session = Session.get(req, res)
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
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      config.stripeWebhookSecret
    )
    console.log('stripe', event)
    json(res, { received: true })
  } else if (get('/')) {
    res.end(await view('home'))
  } else if (get('/authenticate')) {
    res.end(await view('authenticate'))
  } else if (post('/authenticate')) {
    const body = await promisify(textBody)(req, res)
    const { email: to } = parse(body)
    const token = Session.createToken(to)
    const query = 'INSERT INTO authenticate_tokens (value) VALUES ($1)'
    await pool.query(query, [token])

    const link = `${config.vaultUrl}/create-session?token=${token}`

    await mailgun.messages().send({
      ...emails.authenticate(link),
      from: 'Hypergraph <support@hypergraph.xyz>',
      to
    })
    res.end(await view('check-email'))
  } else if (get('/create-session')) {
    const token = new URL(req.url, config.vaultUrl).searchParams.get('token')
    const authenticated = await Session.authenticate({ token, pool, res })
    if (authenticated) redirect(req, res, '/')
  } else if (get('/sign-out')) {
    session.destroy()
    redirect(req, res, '/')
  } else if (get('/modules')) {
    const { rows: modules } = await pool.query('SELECT * FROM modules')
    res.end(
      await view('modules', { modules: JSON.stringify(modules, null, 2) })
    )
  } else if (get('/api/modules')) {
    const { rows: modules } = await pool.query('SELECT * FROM modules')
    json(res, modules)
  } else if (post('/api/modules')) {
    assert(session, 401)
    const { url } = await promisify(jsonBody)(req, res)
    assert(url, 400, '%s: .url required')
    await pool.query('INSERT INTO modules (url) VALUES ($1)', [url])
    res.end('OK')
  }
}

module.exports = http(handler)
