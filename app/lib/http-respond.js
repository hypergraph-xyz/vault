'use strict'

const predirect = require('predirect')

exports.json = (res, json) => {
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(json))
}

exports.redirect = predirect
