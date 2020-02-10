'use strict'

module.exports = req => (method, pathname) => {
  const url = new URL(req.url, 'http://localhost')
  return req.method === method && url.pathname === pathname
}
