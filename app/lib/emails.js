'use strict'

exports.authenticate = ({ link, testWords }) => ({
  subject: 'Authenticate for the Vault',
  text: [
    `Click here to authenticate for the Vault: ${link}.`,
    `The sender should have mentioned "${testWords}".`
  ].join(' ')
})
