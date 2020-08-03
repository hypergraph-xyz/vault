'use strict'

const { NODE_ENV: env } = process.env
const { format } = require('util')
const { STATUS_CODES } = require('http')

// This library provides some sane http behavior around async functions, some
// of which is known from popular frameworks like express.
//
//   - Errors will be caught and logged, with the appropriate http response code
//     and text
//   - If no response was sent, a 404 will be used
//   - Stack traces will be printed during development for 5xx errors

module.exports = handler => (req, res) => {
  handler(req, res)
    .catch(err => {
      res.statusCode = err.statusCode || 500
      if (err.statusCode >= 500) console.error(err)
      let msg
      if (res.statusCode < 500) {
        if (/%s/.test(err.message)) {
          msg = format(err.message, STATUS_CODES[res.statusCode])
        } else {
          msg = err.message
        }
      } else {
        if (env === 'production') {
          msg = 'Internal Server Error'
        } else {
          msg = err.stack
        }
      }
      res.end(msg)
    })
    .then(() => {
      if (res.writableEnded === false || res.finished === false) {
        res.statusCode = 404
        res.end('Not found')
      }
    })
}
