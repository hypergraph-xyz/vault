module.exports = req => ({
  post: url => req.method === 'POST' && req.url === url
})
