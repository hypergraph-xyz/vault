'use strict'

const { NODE_ENV: env } = process.env

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
