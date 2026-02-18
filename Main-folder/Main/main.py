from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
from flask_bcrypt import Bcrypt          # Bcrypt hashes passwords so we never store plain text
from flask_login import (                # flask-login manages user sessions (who is logged in)
    LoginManager, login_user, logout_user,
    login_required, current_user
)
import json
import os
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPICallError

# Import our database helper and User model
from db import get_db
from models import User

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Serve the parent directory so sibling folders (Background/, NeuroSpin/) are reachable
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

PROMPT_FILE = os.path.join(SCRIPT_DIR, "../Configs/prompt.json")
CONFIG_FILE = os.path.join(SCRIPT_DIR, "../Configs/config.json")

app = Flask(__name__, static_folder=ROOT_DIR, static_url_path='')

# secret_key is used by Flask to sign session cookies. Without it, sessions won't work.
# In production you'd use a long random string stored in an env variable.
app.secret_key = "change-this-to-a-random-secret-key"

# supports_credentials=True allows the browser to send cookies (session) with
# cross-origin requests. This is required because the frontend runs on the same
# origin, but we set it explicitly to be safe.
CORS(app, supports_credentials=True)

# Initialize Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Initialize flask-login's LoginManager
login_manager = LoginManager(app)


@login_manager.user_loader
def load_user(user_id):
    """
    flask-login calls this on every request to turn the user ID stored in the
    session cookie back into a User object. We look up the user in the database.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    # Fetch the user row by primary key
    cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()  # returns connection to pool

    if row:
        return User(row["id"], row["username"])
    return None  # user not found = not logged in


@login_manager.unauthorized_handler
def unauthorized():
    """
    When a @login_required route is hit by someone who isn't logged in,
    return a JSON 401 instead of redirecting to a login page (since our
    frontend handles the redirect itself).
    """
    return jsonify({"error": "Not authenticated"}), 401


# ---------------------------------------------------------------------------
# Helper: load JSON config files (prompt, config)
# ---------------------------------------------------------------------------
def load_json_file(path, default_value):
    if not os.path.exists(path):
        print(f"Warning: {path} not found. Using default value.")
        return default_value

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except json.JSONDecodeError:
        print(f"Warning: {path} is empty or corrupted. Using default value.")
        return default_value
    except Exception as e:
        print(f"Warning: failed to load {path}: {e}. Using default value.")
        return default_value


def save_json_file(path, data):
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error: failed to save to {path}: {e}")


# ---------------------------------------------------------------------------
# Load prompt config and Gemini API key
# ---------------------------------------------------------------------------
prompt_config = load_json_file(PROMPT_FILE, {"system_prompt": "", "memory_length": 8})

system_prompt = prompt_config.get("system_prompt", "")
memory_length = prompt_config.get("memory_length", 8)

print(f"System prompt: {system_prompt}")
print(f"Memory length: {memory_length} messages")

config = load_json_file(CONFIG_FILE, {"gemini_api_key": ""})
gemini_api_key = config.get("gemini_api_key", "")

gemini_model = None
GEMINI_MODEL_NAME = 'gemini-2.5-flash'


def initialize_gemini():
    global gemini_model
    if gemini_api_key and gemini_api_key != "Your-Gemini-API-Key-Here":
        print(f"Configuring Google Gemini API for {GEMINI_MODEL_NAME}...")
        try:
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel(GEMINI_MODEL_NAME)

            try:
                print("Validating API key...")
                model.generate_content("test")
                print("Gemini API key verified successfully!")
                gemini_model = model
                return True
            except Exception as e:
                error_str = str(e)
                print(f"API Key validation check: {error_str}")

                if "API_KEY_INVALID" in error_str or "API key not valid" in error_str:
                    print("Invalid API Key detected. User will be prompted.")
                    gemini_model = None
                    return False
                else:
                    print("Validation failed but not due to invalid key (likely network). Keeping model.")
                    gemini_model = model
                    return True

        except Exception as e:
            print(f"Error configuring Gemini API: {e}")
            gemini_model = None
            return False
    else:
        print("Warning: No API key provided for Gemini.")
        gemini_model = None
        return False


initialize_gemini()


# ===========================================================================
# AUTH ROUTES - Registration, Login, Logout, Status
# ===========================================================================

@app.route("/register", methods=["POST"])
def register():
    """
    Create a new user account.

    1. Hash the password with bcrypt so we never store the plain-text password.
       bcrypt adds a random "salt" automatically, meaning even two identical
       passwords produce different hashes.
    2. Insert the new user into the database.
    3. Automatically log the user in so they don't have to type their credentials
       again right after registering.
    """
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Hash the password - bcrypt generates a salt and hashes in one step
    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Insert the new user row
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
            (username, password_hash)
        )
        conn.commit()

        # Get the auto-generated ID of the new user
        new_user_id = cursor.lastrowid

        # Auto-login: create a session for the new user immediately
        user = User(new_user_id, username)
        login_user(user)  # flask-login stores user.id in the session cookie

        return jsonify({"status": "registered", "username": username}), 201

    except Exception as e:
        conn.rollback()
        error_msg = str(e)
        # MySQL error 1062 = duplicate entry (username already taken)
        if "1062" in error_msg:
            return jsonify({"error": "Username already taken"}), 409
        print(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    """
    Authenticate an existing user.

    1. Look up the username in the database.
    2. Compare the provided password against the stored bcrypt hash.
       bcrypt.check_password_hash extracts the salt from the stored hash
       and re-hashes the input to see if they match.
    3. If valid, start a session with flask-login.
    """
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Look up the user by username
    cursor.execute(
        "SELECT id, username, password_hash FROM users WHERE username = %s",
        (username,)
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid username or password"}), 401

    # Compare the plain-text password against the bcrypt hash from the database
    if not bcrypt.check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    # Credentials are correct - start a session
    user = User(row["id"], row["username"])
    login_user(user)

    return jsonify({"status": "logged_in", "username": row["username"]})


@app.route("/logout", methods=["POST"])
@login_required
def logout():
    """
    End the user's session. flask-login clears the session cookie so subsequent
    requests are no longer authenticated.
    """
    logout_user()
    return jsonify({"status": "logged_out"})


@app.route("/auth/status", methods=["GET"])
def auth_status():
    """
    Check whether the current request has a valid session.
    The frontend calls this on page load to decide whether to redirect
    to the login page.
    """
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True,
            "username": current_user.username
        })
    return jsonify({"authenticated": False})


# ===========================================================================
# PAGE ROUTES
# ===========================================================================

@app.route("/")
def index():
    return app.send_static_file('Main/index.html')


@app.route("/login_page")
def login_page():
    return app.send_static_file('Main/login.html')


# ===========================================================================
# CHAT ROUTES - Now use MySQL instead of memory.json
# ===========================================================================

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "online", "model_mode": "Gemini"})


@app.route("/memory", methods=["GET"])
@login_required
def get_memory():
    """
    Return the current user's chat history from the database.
    This replaces the old global memory list / memory.json approach.
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Fetch all messages for the logged-in user, oldest first
    cursor.execute(
        "SELECT role, content FROM messages WHERE user_id = %s ORDER BY created_at ASC",
        (current_user.id,)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(rows)


@app.route("/chat", methods=["POST"])
@login_required
def chat():
    """
    Handle a chat message:
    1. Save the user's message to MySQL
    2. Load the most recent N messages for context
    3. Send the context to Gemini and get a response
    4. Save the AI response to MySQL
    5. Return the response to the frontend
    """
    global gemini_model

    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"response": "I didn't receive a message."})

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        # Save the user's message to the database
        cursor.execute(
            "INSERT INTO messages (user_id, role, content) VALUES (%s, %s, %s)",
            (current_user.id, "user", user_message)
        )
        conn.commit()

        # Load the most recent messages for context (memory_length from prompt config)
        cursor.execute(
            "SELECT role, content FROM messages WHERE user_id = %s "
            "ORDER BY created_at DESC LIMIT %s",
            (current_user.id, memory_length)
        )
        recent_rows = cursor.fetchall()
        # Reverse so they're in chronological order (oldest first)
        recent_messages = list(reversed(recent_rows))

        # Build the prompt for Gemini
        response_text = ""

        if gemini_model:
            print(f"Generating response with Gemini API ({GEMINI_MODEL_NAME}, using last {len(recent_messages)} messages)...")

            conversation_parts = [system_prompt]
            for m in recent_messages:
                role_prefix = "User" if m["role"] == "user" else "Neuro"
                conversation_parts.append(f"{role_prefix}: {m['content']}")
            conversation_parts.append("Neuro:")

            full_prompt = "\n".join(conversation_parts)

            try:
                response = gemini_model.generate_content(full_prompt)

                if response.candidates and response.candidates[0].finish_reason.name == 'SAFETY':
                    print(f"Gemini blocked the prompt.")
                    response_text = "Filtered"
                elif not response.text:
                    print("Gemini returned empty response or candidate.")
                    response_text = "Somone tell Vedal there is a problem with my Internet"
                else:
                    response_text = response.text.strip()

            except GoogleAPICallError as e:
                print(f"Somone tell Vedal there is a problem with my API: {type(e).__name__}: {e}")
                error_message = str(e).lower()
                if "invalid api key" in error_message or "permission denied" in error_message:
                    response_text = "Somone tell Vedal there is a problem with my API"
                elif "quota" in error_message or "limit" in error_message or "resource_exhausted" in error_message:
                    response_text = "API quota exceeded. Please try again later."
                else:
                    response_text = f"API error: {str(e)[:100]}"
            except Exception as e:
                print(f"Unexpected Error during Gemini call: {type(e).__name__}: {e}")
                response_text = f"Somone tell Vedal there is a problem with my AI: {str(e)[:100]}"
        else:
            response_text = "Gemini API is not configured. Please check your API key."

        # Save the AI's response to the database
        cursor.execute(
            "INSERT INTO messages (user_id, role, content) VALUES (%s, %s, %s)",
            (current_user.id, "assistant", response_text)
        )
        conn.commit()

    finally:
        cursor.close()
        conn.close()

    return jsonify({"response": response_text})


@app.route("/clear_memory", methods=["POST"])
@login_required
def clear_memory():
    """
    Delete all chat messages for the current user from the database.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Delete all messages belonging to this user
    cursor.execute("DELETE FROM messages WHERE user_id = %s", (current_user.id,))
    conn.commit()

    cursor.close()
    conn.close()

    print(f"Memory cleared for user {current_user.username}.")
    return jsonify({"status": "cleared"})


# ===========================================================================
# CONFIG ROUTES (unchanged logic, just uses save_json_file)
# ===========================================================================

@app.route("/config", methods=["GET"])
def get_config():
    has_key = bool(gemini_api_key) and gemini_api_key != "Your-Gemini-API-Key-Here"
    return jsonify({
        "has_api_key": has_key,
        "model_available": gemini_model is not None
    })


@app.route("/config", methods=["POST"])
def update_config():
    global config, gemini_api_key, gemini_model

    try:
        data = request.get_json()

        if "gemini_api_key" in data and data["gemini_api_key"] != gemini_api_key:
            gemini_api_key = data["gemini_api_key"]
            config["gemini_api_key"] = gemini_api_key
            print("API key updated")
            initialize_gemini()

        save_json_file(CONFIG_FILE, config)

        return jsonify({
            "status": "success",
            "model_available": gemini_model is not None
        })

    except Exception as e:
        print(f"Error in update_config: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ===========================================================================
# Start the server
# ===========================================================================
if __name__ == "__main__":
    import webbrowser
    import threading

    print("\nNeuro Chatbot Server")
    print("Server running at http://127.0.0.1:5000")
    print("Opening browser...")
    print("Press Ctrl+C to stop\n")

    def open_browser():
        import time
        time.sleep(1.5)
        webbrowser.open('http://127.0.0.1:5000')

    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=5000)
