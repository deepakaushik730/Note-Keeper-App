const jwt = require('jsonwebtoken')
require('dotenv').config()
const jwtsecret = process.env.JWT_SECRET

function auth(req, res, next) {
  const authheader = req.headers.authorization
  if (!authheader) return res.status(401).json({ error: 'missing authorization' })
  const parts = authheader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid authorization format' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, jwtsecret)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

module.exports = auth
