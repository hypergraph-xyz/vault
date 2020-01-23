'use strict'

const cookie = require('cookie')

exports.set = (res, name, value) =>
  res.setHeader('set-cookie', cookie.serialize(name, value, { httpOnly: true }))

exports.unset = (res, name) =>
  res.setHeader('set-cookie', cookie.serialize(name, '', { maxAge: 0 }))

exports.get = (req, name) => cookie.parse(req.headers.cookie || '')[name]
