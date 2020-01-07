'use strict'

const stripe = require('stripe')('TODO_STRIPE_ID')

const createWebhookEndpoint = () =>
  // https://stripe.com/docs/api/webhook_endpoints/create
  stripe.webhookEndpoints.create({
    url: 'https://todo.com',
    enabled_events: ['charge.failed', 'charge.succeeded']
  })

module.exports = createWebhookEndpoint
