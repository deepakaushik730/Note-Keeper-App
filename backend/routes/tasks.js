/**
 * @file API routes for all task-related operations.
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /tasks/ -> gets all tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY status, position");
    res.json(result.rows);
  } catch (err) {
    console.error("API Error on GET /tasks:", err);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// POST /tasks/ -> creates a new task
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const status = req.body.status || "todo";

    // Calculate position for the new task at the end of its column.
    const posRes = await pool.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM tasks WHERE status = $1",
      [status]
    );
    const position = posRes.rows[0].pos;

    const result = await pool.query(
      "INSERT INTO tasks(title, status, position) VALUES($1, $2, $3) RETURNING *",
      [title, status, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("API Error on POST /tasks:", err);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// PUT /tasks/:id -> updates an existing task (e.g., title, status)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, position } = req.body;

    // Dynamically build query to allow partial updates.
    const fields = [];
    const values = [];
    let idx = 1;
    if (title !== undefined) {
      fields.push(`title=$${idx++}`);
      values.push(title);
    }
    if (status !== undefined) {
      fields.push(`status=$${idx++}`);
      values.push(status);
    }
    if (position !== undefined) {
      fields.push(`position=$${idx++}`);
      values.push(position);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id); // Add the id for the WHERE clause.
    const q = `UPDATE tasks SET ${fields.join(",")} WHERE id=$${idx} RETURNING *`;

    const result = await pool.query(q, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`API Error on PUT /tasks/${req.params.id}:`, err);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// POST /tasks/reorder -> updates status/position for multiple tasks
router.post("/reorder", async (req, res) => {
  const { columns } = req.body;
  const client = await pool.connect();
  try {
    // Transaction ensures all updates succeed or none do.
    await client.query("BEGIN");
    for (const status of Object.keys(columns)) {
      const ids = columns[status] || [];
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          "UPDATE tasks SET status=$1, position=$2 WHERE id=$3",
          [status, i, ids[i]]
        );
      }
    }
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("API Error on POST /tasks/reorder (Transaction Rolled Back):", err);
    res.status(500).json({ error: "An internal server error occurred" });
  } finally {
    client.release();
  }
});

// DELETE /tasks/:id -> deletes a task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(`API Error on DELETE /tasks/${req.params.id}:`, err);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

module.exports = router;