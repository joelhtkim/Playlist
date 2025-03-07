from flask import Blueprint, session
from .spotify import login, callback, get_playlists
from flask import Blueprint, session, jsonify, request
from .spotify import get_playlists, Spotify
from .database import save_playlist, get_saved_playlists
from .database import get_db
from flask import render_template, redirect
import os


from flask import Blueprint

main = Blueprint("main", __name__, url_prefix="/")



@main.route("/")
def index():
    print("Rendering index.html...")
    return render_template("index.html")
@main.route("/login")
def spotify_login():
    return login()

@main.route("/callback")
def spotify_callback():
    return callback()

@main.route("/playlists")
def playlists():
    return get_playlists()

@main.route("/playlists/save", methods=["POST"])
def save_user_playlist():
    print("Session Data:", session) 
    user_id = session.get("user_id")  
    if not user_id:
        return {"message": "User not logged in"}, 401

    # Get playlist data from the request body
    playlist = request.json
    if not playlist:
        return {"message": "No playlist data provided"}, 400

    db = get_db()
    # Check if the playlist already exists
    existing = db.playlists.find_one({"user_id": user_id, "playlist_id": playlist["id"]})
    if existing:
        return {"message": "Playlist already saved"}

    # Save the playlist to MongoDB
    db.playlists.insert_one({
        "user_id": user_id,
        "playlist_id": playlist["id"],
        "name": playlist["name"],
        "tracks": playlist["tracks"]
    })
    return {"message": "Playlist saved successfully"}



@main.route("/playlists/saved", methods=["GET"])
def get_user_playlists():
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401

    playlists = get_saved_playlists(user_id)


    return jsonify({"playlists": playlists})


@main.route("/test_db")
def test_db():
  

    try:
        db = get_db()  
        print("Database Instance:", db) 
        collections = db.list_collection_names()  
        return {"message": "MongoDB connection successful", "collections": collections}
    except Exception as e:
        print("Error:", e)  
        return {"error": str(e)}, 500

@main.route("/playlists/fetch", methods=["GET"])
def fetch_playlists():
    token_info = session.get("token_info")
    if not token_info:
        return {"message": "User not logged in"}, 401

    sp = Spotify(auth=token_info["access_token"])
    playlists = sp.current_user_playlists()

    db = get_db()
    user_id = session.get("user_id")

    db.playlists.delete_many({"user_id": user_id})

    playlist_data = [
        {
            "id": playlist.get("id"),
            "name": playlist.get("name"),
            "tracks": playlist.get("tracks", {}).get("total", 0),
            "image": playlist["images"][0]["url"] if playlist.get("images") else None
        }
        for playlist in playlists.get("items", [])
    ]

    for playlist in playlist_data:
        db.playlists.insert_one({
            "user_id": user_id,
            "playlist_id": playlist["id"],
            "name": playlist["name"],
            "tracks": playlist["tracks"],
            "image": playlist["image"]
        })

    return {"playlists": playlist_data}



@main.route("/playlists/delete", methods=["POST"])
def delete_playlist():
    user_id = session.get("user_id")
    if not user_id:
        return {"message": "User not logged in"}, 401

    playlist_id = request.json.get("playlist_id")
    if not playlist_id:
        return {"message": "Playlist ID is required"}, 400

    db = get_db()
    result = db.playlists.delete_one({"user_id": user_id, "playlist_id": playlist_id})
    if result.deleted_count == 0:
        return {"message": "Playlist not found"}, 404

    return {"message": "Playlist deleted successfully"}




@main.route("/playlists/<playlist_id>/tracks", methods=["GET"])
def get_playlist_tracks(playlist_id):
    token_info = session.get("token_info")
    if not token_info:
        return {"message": "User not logged in"}, 401

    sp = Spotify(auth=token_info["access_token"])
    try:
        playlist_tracks = sp.playlist_tracks(playlist_id)
        tracks = [
            {
                "name": track["track"]["name"],
                "preview_url": track["track"]["preview_url"],  
                "album_image": track["track"]["album"]["images"][0]["url"] if track["track"]["album"]["images"] else None,
                "album": track["track"]["album"]["name"],
                "artist": ", ".join(artist["name"] for artist in track["track"]["artists"])
            }
            for track in playlist_tracks.get("items", [])
        ]
        return {"tracks": tracks}
    except Exception as e:
        print(f"Error fetching playlist tracks: {e}")
        return {"message": "Error fetching playlist tracks"}, 500



@main.route("/check-login-status")
def check_login_status():
    token_info = session.get("token_info")
    if token_info:
        return {"logged_in": True}
    return {"logged_in": False}




@main.route("/logout")
def logout():
    session.clear()  
    return {"message": "Logged out successfully"}


#guess the song


@main.route("/playlists/<playlist_id>/game-tracks", methods=["GET"])
def get_game_tracks(playlist_id):
    token_info = session.get("token_info")
    if not token_info:
        return {"message": "User not logged in"}, 401

    sp = Spotify(auth=token_info["access_token"])
    try:
        playlist_tracks = sp.playlist_tracks(playlist_id)
        import json
        print(json.dumps(playlist_tracks, indent=2))

        tracks = [
            {
                "name": track["track"]["name"],
                "preview_url": track["track"]["preview_url"],
                "artist": ", ".join(artist["name"] for artist in track["track"]["artists"]),
            }
            for track in playlist_tracks.get("items", [])
            if track["track"]["preview_url"] 
        ]
        return {"tracks": tracks}
    except Exception as e:
        print(f"Error fetching playlist tracks: {e}")
        return {"message": "Error fetching playlist tracks"}, 500


@main.route("/quiz/<playlist_id>")
def quiz(playlist_id):
    return render_template("quiz.html", playlist_id=playlist_id)


