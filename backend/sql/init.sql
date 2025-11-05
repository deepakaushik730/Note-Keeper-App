-- ================================================
-- 1️⃣ Drop existing tables (optional reset)
-- ================================================
-- Uncomment the below lines if you want a clean reset before setup.

-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;


-- ================================================
-- 2️⃣ Create 'users' table
-- ================================================
-- Stores registered users with secure hashed passwords.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ================================================
-- 3️⃣ Create 'tasks' table
-- ================================================
-- Stores user tasks (like notes, todos, etc.)

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id INTEGER                           -- will link to users table
);


-- ================================================
-- 4️⃣ Add Foreign Key (task → user)
-- ================================================
-- Ensures each task belongs to a valid user.
-- 'ON DELETE CASCADE' means when a user is deleted,
-- all their tasks are automatically removed.

ALTER TABLE tasks
ADD CONSTRAINT fk_task_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;


-- ================================================
-- 5️⃣ Create useful indexes for faster lookups
-- ================================================
-- Helps quickly fetch tasks by user or by status+position.

CREATE INDEX IF NOT EXISTS idx_tasks_status_position 
  ON tasks(status, position);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id 
  ON tasks(user_id);


-- ================================================
-- ✅ Final Schema Summary
-- ================================================
-- users:
--   id SERIAL PRIMARY KEY
--   email TEXT UNIQUE NOT NULL
--   password_hash TEXT NOT NULL
--   created_at TIMESTAMPTZ DEFAULT now()
--
-- tasks:
--   id SERIAL PRIMARY KEY
--   title TEXT NOT NULL
--   status TEXT DEFAULT 'todo'
--   position INTEGER DEFAULT 0
--   created_at TIMESTAMPTZ DEFAULT now()
--   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
--
-- Indexes:
--   idx_tasks_status_position (status, position)
--   idx_tasks_user_id (user_id)