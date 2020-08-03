'use strict'

module.exports = req => {
  const url = new URL(req.url, 'http://localhost')
  return `${req.method} ${url.pathname}`
}
