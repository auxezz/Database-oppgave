-- schema.sql - Run this in MySQL Workbench to create the database and tables
--
-- This creates:
--   1. The neurochat database
--   2. A users table (stores usernames and hashed passwords)
--   3. A messages table (stores chat history per user)
--   4. An index on messages for fast lookups by user + time

-- Create the database with utf8mb4 encoding (supports emojis and all Unicode)
CREATE DATABASE IF NOT EXISTS neurochat
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE neurochat;

-- Users table: each row is one registered account
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,   -- unique user ID, auto-increments
    username      VARCHAR(50)  NOT NULL UNIQUE,      -- login name, must be unique
    password_hash VARCHAR(255) NOT NULL,             -- bcrypt hash of the password (never plain text!)
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP  -- when the account was created
);

-- Messages table: each row is one chat message (user or AI)
CREATE TABLE messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,       -- unique message ID
    user_id    INT          NOT NULL,                -- which user this message belongs to
    role       ENUM('user', 'assistant') NOT NULL,   -- who sent it: the user or the AI
    content    TEXT         NOT NULL,                 -- the actual message text
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- when it was sent
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  -- if user is deleted, delete their messages too
);

-- Index for faster queries: when we load a user's chat history sorted by time,
-- MySQL can use this index instead of scanning the entire messages table
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at);
