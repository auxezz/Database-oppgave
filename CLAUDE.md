# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Neuro AI** — a web-based AI chatbot with user authentication and persistent chat history. Backend is Python/Flask with MySQL; frontend is vanilla HTML/CSS/JS; AI responses come from Google's Gemini API.

## Running the Application

```bash
# Install Python dependencies (from repo root)
pip install -r requirements.txt

# Start the Flask server
cd "Database-oppgave/Main-folder/Main"
python main.py
# Serves at http://127.0.0.1:5000
```

## Database Setup

1. Run `Database-oppgave/Main-folder/Main/schema.sql` in MySQL to create the `neurochat` database and tables.
2. Default credentials in `db.py`: host `127.0.0.1`, user `root`, password `root`, database `neurochat`.
3. To change credentials, edit `Database-oppgave/Main-folder/Main/db.py`.

## Configuration

- **`Database-oppgave/Main-folder/Configs/config.json`** — stores the Gemini API key. Can also be set via the web UI modal after login.
- **`Database-oppgave/Main-folder/Configs/prompt.json`** — controls the Gemini system prompt and `memory_length` (how many prior messages are sent as context; default: 8).

## Architecture

```
Browser
  index.html        → Landing page
  login.html        → Login/register (single page, toggles mode)
  Neuro.html        → Main chat UI
  script.js         → Auth check, chat send/receive, history loading
  styles.css        → Dark theme, pink/cyan accents
  tiles.js          → Animated background (decorative)
  Neurospin.js      → Avatar animation + audio beeps during typing

Flask (main.py)
  /                 → Serves index.html
  /login_page       → Serves login.html
  /register         POST — create account (bcrypt hash stored)
  /login            POST — authenticate, create session
  /logout           POST — end session
  /auth/status      GET  — check session validity
  /chat             POST — send message → Gemini → save to DB → return response
  /memory           GET  — fetch user's chat history
  /clear_memory     POST — delete all messages for user
  /config           GET/POST — read or update Gemini API key
  /ping             GET  — health check

db.py       — MySQL connection pool (5 connections); imported by main.py
models.py   — User class extending flask-login's UserMixin
schema.sql  — DDL for `users` and `messages` tables
```

## Key Implementation Details

- **Authentication**: bcrypt password hashing via flask-bcrypt; sessions via flask-login with `@login_required` guards.
- **Chat memory**: The last `memory_length` messages are fetched from MySQL and sent to Gemini as conversation history on each `/chat` request.
- **Connection pooling**: `db.py` creates a named pool on import; call `db.get_connection()` to borrow a connection, always release it after use.
- **Gemini safety filter**: If the API returns a blocked response, the server returns the string `"Filtered"` to the frontend.
- **Developer shortcut**: Triple-clicking the Neuro avatar in the chat UI skips API key validation (debug mode).
- **All protected routes require an active flask-login session** — the frontend checks `/auth/status` on page load and redirects unauthenticated users to `/login_page`.
