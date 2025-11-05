const express = require("express")
const router = express.Router()
const pool = require("../db")
const auth = require("../middleware/auth") // JWT middleware

// Apply auth to all routes
router.use(auth)

// GET /tasks -> get all tasks for the logged-in user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id=$1 ORDER BY status, position",
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error("API Error on GET /tasks:", err)
    res.status(500).json({ error: "An internal server error occurred" })
  }
})

// POST /tasks -> create a new task for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { title } = req.body
    const status = req.body.status || "todo"

    const posRes = await pool.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM tasks WHERE status=$1 AND user_id=$2",
      [status, req.user.id]
    )
    const position = posRes.rows[0].pos

    const result = await pool.query(
      "INSERT INTO tasks(title, status, position, user_id) VALUES($1, $2, $3, $4) RETURNING *",
      [title, status, position, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error("API Error on POST /tasks:", err)
    res.status(500).json({ error: "An internal server error occurred" })
  }
})

// PUT /tasks/:id -> update an existing task owned by the user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { title, status, position } = req.body

    const fields = []
    const values = []
    let idx = 1

    if (title !== undefined) {
      fields.push(`title=$${idx++}`)
      values.push(title)
    }
    if (status !== undefined) {
      fields.push(`status=$${idx++}`)
      values.push(status)
    }
    if (position !== undefined) {
      fields.push(`position=$${idx++}`)
      values.push(position)
    }

    if (fields.length === 0)
      return res.status(400).json({ error: "No fields to update" })

    values.push(req.user.id)
    values.push(id)
    const q = `UPDATE tasks SET ${fields.join(",")} 
               WHERE user_id=$${idx++} AND id=$${idx} RETURNING *`

    const result = await pool.query(q, values)
    if (!result.rowCount)
      return res.status(404).json({ error: "Task not found or unauthorized" })

    res.json(result.rows[0])
  } catch (err) {
    console.error(`API Error on PUT /tasks/${req.params.id}:`, err)
    res.status(500).json({ error: "An internal server error occurred" })
  }
})

// POST /tasks/reorder -> reorder user’s tasks
router.post("/reorder", async (req, res) => {
  const { columns } = req.body
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const status of Object.keys(columns)) {
      const ids = columns[status] || []
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          "UPDATE tasks SET status=$1, position=$2 WHERE id=$3 AND user_id=$4",
          [status, i, ids[i], req.user.id]
        )
      }
    }
    await client.query("COMMIT")
    res.json({ ok: true })
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("API Error on POST /tasks/reorder:", err)
    res.status(500).json({ error: "An internal server error occurred" })
  } finally {
    client.release()
  }
})

// DELETE /tasks/:id -> delete only user’s own task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      "DELETE FROM tasks WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    )
    if (!result.rowCount)
      return res.status(404).json({ error: "Task not found or unauthorized" })
    res.json({ ok: true })
  } catch (err) {
    console.error(`API Error on DELETE /tasks/${req.params.id}:`, err)
    res.status(500).json({ error: "An internal server error occurred" })
  }
})

module.exports = router
