import os
from flask import request, redirect, session, url_for
from spotipy.oauth2 import SpotifyOAuth
from spotipy import Spotify
from dotenv import load_dotenv
from flask import flash



# Load environment variables
load_dotenv()

# Spotify credentials
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPE = "playlist-read-private playlist-read-collaborative"

# Initialize Spotify OAuth object
sp_oauth = SpotifyOAuth(
    client_id=SPOTIFY_CLIENT_ID,
    client_secret=SPOTIFY_CLIENT_SECRET,
    redirect_uri=REDIRECT_URI,
    scope=SCOPE,
    show_dialog=True
)

# Login route
def login():
    auth_url = sp_oauth.get_authorize_url()
    print("Spotify Authorization URL:", auth_url)  # Debugging
    return redirect(auth_url)



# Callback route
def callback():
    # Get the token from the callback query
    code = request.args.get("code")  # Get the authorization code from Spotify
    if not code:
        return {"error": "Authorization code not received"}, 400

    # Exchange the authorization code for an access token
    token_info = sp_oauth.get_access_token(code)  # Ensure sp_oauth is initialized globally
    session["token_info"] = token_info  # Store token information in the session

    # Use the token to fetch the user's Spotify profile
    sp = Spotify(auth=token_info["access_token"])
    user_profile = sp.current_user()  # Get the current user's Spotify profile
    session["user_id"] = user_profile["id"]  # Save the user's Spotify ID in the session
    print("User ID stored in session:", session["user_id"])  # Debugging

    # Redirect to a relevant endpoint (e.g., playlist retrieval or homepage)
    flash("Successfully logged in!")
    return redirect(url_for("main.index"))  # Replace with the desired route


# Fetch playlists
def get_playlists():
    # Check if token is valid
    token_info = session.get("token_info", {})
    if not token_info or sp_oauth.is_token_expired(token_info):
        return redirect(url_for("main.login"))

    # Use token to access Spotify API
    sp = Spotify(auth=token_info["access_token"])
    playlists = sp.current_user_playlists()

    # Process playlist data
    data = [{"name": p["name"], "tracks": p["tracks"]["total"]} for p in playlists["items"]]
    return {"playlists": data}
