'use strict'

const build = method => req => pathname => {
  const url = new URL(req.url, 'https://vault.hypergraph.xyz')
  return req.method === method && url.pathname === pathname
}

const post = build('POST')
const get = build('GET')

module.exports = req => ({
  post: post(req),
  get: get(req)
})
