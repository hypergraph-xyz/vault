'use strict'

const cookie = require('cookie')
const createBranca = require('branca')
const { brancaKey } = require('./config')

const branca = createBranca(brancaKey)

class Session {
  constructor ({ res, email }) {
    this.res = res
    this.email = email
  }

  destroy () {
    const header = cookie.serialize('token', '', { maxAge: 0 })
    this.res.setHeader('set-cookie', header)
  }

  static get (req, res) {
    let token, email

    if (req.headers.authorization) {
      const segs = req.headers.authorization.split(' ')
      if (segs[0] === 'Bearer' && segs[1]) token = segs[1]
    } else {
      token = cookie.parse(req.headers.cookie || '').token
    }
    try {
      email = branca.decode(token).toString()
    } catch (_) {
      return
    }
    return new Session({ res, email })
  }

  static createToken (mail) {
    return branca.encode(mail)
  }

  static async authenticate ({ token, pool, res }) {
    const selectQuery = `
      SELECT callback FROM authenticate_tokens WHERE value = $1
    `
    const { rows } = await pool.query(selectQuery, [token])
    const callback = rows[0] && rows[0].callback

    const deleteQuery = `
      DELETE FROM authenticate_tokens
      WHERE value = $1
      AND created_at >= NOW() - '1 day'::interval
    `
    const { rowCount } = await pool.query(deleteQuery, [token])

    const authenticated = rowCount === 1
    if (authenticated) {
      const header = cookie.serialize('token', token, { httpOnly: true })
      res.setHeader('set-cookie', header)
    }

    const cleanup = `
      DELETE FROM authenticate_tokens
      WHERE created_at < NOW() - '1 day'::interval
    `
    pool.query(cleanup).catch(console.error)

    return { authenticated, callback }
  }
}

module.exports = Session
