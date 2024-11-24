from flask import current_app

def save_playlist(user_id, playlist):
    """
    Save a playlist to the MongoDB database for a specific user.
    """
    db = get_db()
    # Check if the playlist already exists
    existing_playlist = db.playlists.find_one({"user_id": user_id, "playlist_id": playlist["id"]})
    if existing_playlist:
        return {"message": "Playlist already saved"}

    # Insert new playlist
    db.playlists.insert_one({
        "user_id": user_id,
        "playlist_id": playlist["id"],
        "name": playlist["name"],
        "tracks": playlist["tracks"],
        "image": playlist["image"]  # Add the `image` field here
    })
    return {"message": "Playlist saved successfully"}



def get_saved_playlists(user_id):
    db = get_db()
    playlists = db.playlists.find({"user_id": user_id})
    return [
        {
            "playlist_id": p["playlist_id"],
            "name": p["name"],
            "tracks": p["tracks"],
            "image": p.get("image")  # Safely retrieve the `image` field if present
        }
        for p in playlists
    ]





def get_db():
    """
    Retrieve the MongoDB database instance from the Flask app context.
    """
    print("Current App:", current_app)
    print("Mongo Instance:", getattr(current_app, "mongo", None))

    if not current_app or not hasattr(current_app, "mongo"):
        raise RuntimeError("MongoDB is not initialized")

    # Explicitly select the database
    database = current_app.mongo.cx["playlists"]  # Replace "playlists" with your actual database name
    print("Database Instance:", database)  # Debugging: Ensure this is not None
    return database

