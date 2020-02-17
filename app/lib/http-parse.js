'use strict'

const querystring = require('querystring')

module.exports = (req, body) =>
  req.headers['content-type'] === 'application/json'
    ? JSON.parse(body)
    : querystring.parse(body)
