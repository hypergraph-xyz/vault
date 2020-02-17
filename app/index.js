'use strict'

const createStripe = require('stripe')
const textBody = require('body')
const jsonBody = require('body/json')
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
      res.end(await view('check-email', { testWords }))
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
    case 'POST /api/modules': {
      assert(session, 401)
      const { url } = await promisify(jsonBody)(req, res)
      assert(url, 400, '%s: .url required')
      await pool.query('INSERT INTO modules (url) VALUES ($1)', [url])
      res.end('OK')
      break
    }
  }
}

module.exports = http(handler)
