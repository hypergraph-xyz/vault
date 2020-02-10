'use strict'

const createBranca = require('branca')
const cookie = require('./http-cookie')
const { brancaKey } = require('./config')

const branca = createBranca(brancaKey)

class Session {
  constructor ({ res, email }) {
    this.res = res
    this.email = email
  }

  destroy () {
    cookie.unset(this.res, 'token')
  }

  static get (req, res) {
    const token = cookie.get(req, 'token')
    let email
    if (token) {
      try {
        email = branca.decode(token).toString()
      } catch (_) {}
    }
    if (!email) return
    return new Session({ res, email })
  }

  static createToken (mail) {
    return branca.encode(mail)
  }

  static async authenticate ({ token, pool, res }) {
    const query = `
      DELETE FROM authenticate_tokens
      WHERE value = $1
      AND created_at >= NOW() - '1 day'::interval
    `
    const { rowCount } = await pool.query(query, [token])

    const authenticated = rowCount === 1
    if (authenticated) cookie.set(res, 'token', token)

    const cleanup = `
      DELETE FROM authenticate_tokens
      WHERE created_at < NOW() - '1 day'::interval
    `
    pool.query(cleanup).catch(console.error)

    return authenticated
  }
}

module.exports = Session
