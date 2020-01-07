'use strict'

const { NODE_ENV: env } = process.env

// This library provides some sane http behavior around async functions, some
// of which is known from popular frameworks like express.
//
//   - Errors will be caught and logged, with the appropriate http response code
//     and text
//   - If no response was sent, a 404 will be used
//   - Useful request information will be logged

module.exports = handler => (req, res) => {
  const start = new Date()
  handler(req, res)
    .catch(err => {
      console.error(err)
      res.statusCode = err.statusCode || 500
      const msg = env === 'production' ? 'Internal Server Error' : err.stack
      res.end(msg)
    })
    .then(() => {
      if (!res.writableEnded) {
        res.statusCode = 404
        res.end('Not found')
      }

      console.log(
        req.method,
        req.url,
        res.statusCode,
        `(${new Date() - start} ms)`
      )
    })
}
