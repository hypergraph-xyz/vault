'use strict'

exports.signIn = link => ({
  subject: 'Sign in to the Vault',
  text: `Click here to sign in to the Vault: ${link}`
})

exports.signUp = link => ({
  subject: 'Sign up for the Vault',
  text: `Click here to sign up for the Vault: ${link}`
})
