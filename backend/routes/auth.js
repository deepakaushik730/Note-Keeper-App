const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const pool = require('../db') // keep this one
require('dotenv').config()

const jwtsecret = process.env.JWT_SECRET
const jwtexpires = process.env.JWT_EXPIRES_IN || '1h'
const bcrounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10)

router.post('/signup', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const client = await pool.connect()
  try {
    const check = await client.query('select id from users where email=$1', [email])
    if (check.rowCount) return res.status(409).json({ error: 'email already registered' })

    const password_hash = await bcrypt.hash(password, bcrounds)
    const insert = await client.query(
      'insert into users(email,password_hash) values($1,$2) returning id,email',
      [email, password_hash]
    )

    const user = insert.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, jwtsecret, { expiresIn: jwtexpires })
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  } finally {
    client.release()
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const client = await pool.connect()
  try {
    const q = await client.query('select id,password_hash from users where email=$1', [email])
    if (!q.rowCount) return res.status(401).json({ error: 'invalid credentials' })

    const user = q.rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })

    const token = jwt.sign({ id: user.id, email }, jwtsecret, { expiresIn: jwtexpires })
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  } finally {
    client.release()
  }
})

module.exports = router
