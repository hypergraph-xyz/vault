'use strict'

const stripe = require('stripe')('TODO_STRIPE_ID')

// https://stripe.com/docs/api/webhook_endpoints/create
stripe.webhookEndpoints.create(
  {
    url: 'https://todo.com',
    enabled_events: ['charge.failed', 'charge.succeeded']
  },
  (err, webhookEndpoint) => {
    // TODO
    if (err) console.error(err)
  }
)
