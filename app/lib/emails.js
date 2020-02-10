'use strict'

exports.authenticate = link => ({
  subject: 'Authenticate for the Vault',
  text: `Click here to authenticate for the Vault: ${link}`
})
