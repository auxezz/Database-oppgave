-- ============================================
-- DATABASE SCHEMA FOR TODO/TASK MANAGER
-- ============================================
-- This file defines the database structure for storing tasks
-- Using SQLite as the database engine

-- Create tasks table if it doesn't already exist
CREATE TABLE IF NOT EXISTS tasks (
    -- Primary key: auto-incrementing unique identifier for each task
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Required fields
    title TEXT NOT NULL,              -- Task title (required)

    -- Optional fields
    description TEXT,                 -- Detailed description of the task
    category TEXT DEFAULT 'General',  -- Task category (e.g., Work, Personal, School)

    -- Priority: Must be one of three values (Low, Medium, High)
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),

    -- Due date stored as ISO 8601 text format (YYYY-MM-DD)
    due_date TEXT,

    -- Completion status: 0 = not completed, 1 = completed
    completed INTEGER DEFAULT 0,

    -- Timestamps: automatically set when task is created and updated
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index on completed status for faster filtering queries
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Create index on category for faster category filtering
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

-- Create index on priority for faster priority sorting
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Create index on due_date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
