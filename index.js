'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const { promisify } = require('util')
const http = require('./lib/http-handler')
const route = require('./lib/http-route')
const { json, redirect } = require('http-responders')
const createView = require('./lib/http-view')
const { Pool } = require('pg')
const parse = require('./lib/http-parse')
const Mailgun = require('mailgun-js')
const emails = require('./lib/emails')
const config = require('./lib/config')
const assert = require('http-assert')
const Session = require('./lib/session')
const words = require('friendly-words')

const stripe = createStripe(config.stripeSecretKey)
const pool = new Pool()
const mailgun = new Mailgun({
  apiKey: config.mailgunApiKey,
  domain: config.mailgunDomain,
  host: config.mailgunHost
})

const handler = async (req, res) => {
  const session = Session.get(req, res)
  const view = createView({ session })

  switch (route(req)) {
    case 'GET /health': {
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
      break
    }
    case 'POST /stripe': {
      const body = await promisify(textBody)(req, res, { encoding: undefined })
      const sig = req.headers['stripe-signature']
      const event = stripe.webhooks.constructEvent(
        body,
        sig,
        config.stripeWebhookSecret
      )
      console.log('stripe', event)
      json(res, { received: true })
      break
    }
    case 'GET /': {
      res.end(await view('home'))
      break
    }
    case 'GET /authenticate': {
      res.end(await view('authenticate'))
      break
    }
    case 'POST /authenticate': {
      const body = await promisify(textBody)(req, res)
      const { email, callback } = parse(req, body)
      const link = await Session.request({ pool, email, callback })
      const testWords = words.objects
        .sort(() => (Math.random() > 0.5 ? 1 : -1))
        .slice(0, 3)
        .join(' ')
      await mailgun.messages().send({
        ...emails.authenticate({ link, testWords }),
        from: 'Hypergraph <support@hypergraph.xyz>',
        to: email
      })
      if (req.headers.accept === 'application/json') {
        json(res, { testWords })
      } else {
        res.end(await view('check-email', { testWords }))
      }
      break
    }
    case 'GET /create-session': {
      const params = new URL(req.url, config.vaultUrl).searchParams
      const token = params.get('token')
      const { authenticated, callback } = await Session.authenticate({
        token,
        pool,
        res
      })
      if (authenticated) {
        if (callback) {
          res.end(await view('create-session', { callback, token }))
        } else {
          redirect(req, res, '/')
        }
      }
      break
    }
    case 'GET /sign-out': {
      session.destroy()
      redirect(req, res, '/')
      break
    }
    case 'GET /modules': {
      const { rows: modules } = await pool.query('SELECT * FROM modules')
      res.end(
        await view('modules', { modules: JSON.stringify(modules, null, 2) })
      )
      break
    }
    case 'GET /api/modules': {
      const { rows: modules } = await pool.query('SELECT * FROM modules')
      json(res, modules)
      break
    }
    case 'GET /api/keys': {
      const { rows: modules } = await pool.query('SELECT url FROM modules')
      json(
        res,
        modules.map(module => module.url)
      )
      break
    }
    case 'POST /api/modules': {
      const url = await promisify(textBody)(req, res)
      assert(
        /^hyper:\/\/[a-f0-9]{64}(\+[0-9]+)?$/i.test(url),
        400,
        '%s: invalid url'
      )
      try {
        await pool.query('INSERT INTO modules (url) VALUES ($1)', [url])
      } catch (err) {
        if (err.constraint !== 'url_unique') throw err
      }
      res.end('OK')
      break
    }
    case 'GET /api/discover': {
      json(res, [
        'hypergraph://43eb22e34ad1f03615200dfcf16e092b8f571cc88b1355d0e9b77845b4052832+25',
        'hypergraph://2ae99d1441b7605a9775b2e1c7835d4ddaaafc9472b0a0fd6e9bf9607dd210b5',
        'hypergraph://d462250eb6d04c1ff2d4aa4b468f74419ab52a682e9f9d2805fde7baf6e46795',
        'hypergraph://f6caa70b49c2dde0f884f739d3096deb998af9d5feecda38f75bd1477c3c3ff3',
        'hypergraph://051a4e699409bc354157d4820978c6dded0816161881c54d33ff9d0de38903cf+4',
        'hypergraph://4faae28c5f61d90d8cd04a545b4814daa719c01b6e03e14dae33f986edf69208+17',
        'hypergraph://8f694fbdf324cbb83deaecb4a82d13fbff817d8237726cbe0c3f0aa37c13ae11+6',
        'hypergraph://3999d78fcbdf4544f9f3a9028956c572e012a2181454a79ffe5e560746888e3f+8',
        'hypergraph://27fbb1cf8413b28d29ace15282cda9080f225f3750e2078c986aff4ff82831be+9'
      ])
      break
    }
  }
}

module.exports = http(handler)
