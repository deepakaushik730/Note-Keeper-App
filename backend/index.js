require("dotenv").config()

const express = require("express")
const cors = require("cors")

const auth = require("./middleware/auth")
const authRoutes = require("./routes/auth")
const tasks = require("./routes/tasks")

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

app.use("/api/auth", authRoutes)
app.use("/api/tasks", auth, tasks)

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})
