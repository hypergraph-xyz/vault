module.exports = req => ({
  post: url => req.method === 'POST' && req.url === url,
  get: url => req.method === 'GET' && req.url === url
})
