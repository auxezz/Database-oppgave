# models.py - User model for flask-login
#
# flask-login needs a User class so it knows how to:
#   - identify who is logged in (get_id)
#   - check if the user is authenticated / active / anonymous
#
# UserMixin is a helper from flask-login that provides default implementations
# for all of those methods. By inheriting from it, our User class automatically
# gets is_authenticated = True, is_active = True, is_anonymous = False, etc.
# All we need to add is the actual user data (id, username).

from flask_login import UserMixin


class User(UserMixin):
    """
    Represents a logged-in user.

    flask-login stores the user's ID in the session cookie. When a request
    comes in, flask-login calls the user_loader callback (defined in main.py)
    with that ID, which queries the database and returns a User object.
    """

    def __init__(self, user_id, username):
        # The unique database ID (users.id) - flask-login uses this to track sessions
        self.id = user_id
        # The display name shown in the chat
        self.username = username
