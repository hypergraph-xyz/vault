const required = Symbol('required')

const config = {
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  mailgunApiKey: process.env.MAILGUN_API_KEY || required,
  mailgunDomain: process.env.MAILGUN_DOMAIN || 'smtp.hypergraph.xyz',
  mailgunHost: process.env.MAILGUN_HOST || 'api.eu.mailgun.net',
  vaultUrl: process.env.VAULT_URL || 'http://localhost:8080',
  brancaKey: process.env.BRANCA_KEY || required
}

for (const [key, value] of Object.entries(config)) {
  if (value === required) {
    throw new Error(`${key} required`)
  }
}

module.exports = config
