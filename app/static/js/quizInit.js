import { startQuizWithPlaylist } from './quiz.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("quizInit.js is running on:", document.title);

    

    // Extract the playlist ID from the HTML
    const playlistId = document.getElementById('quiz-container')?.dataset.playlistId;

    if (!playlistId) {
        console.error("Playlist ID not provided!");
        return;
    }

    console.log("Playlist ID:", playlistId);

    // Fetch tracks for the playlist
    fetch(`/playlists/${playlistId}/game-tracks`)
        .then(response => response.json())
        .then(data => {
            if (!data.tracks || data.tracks.length === 0) {
                alert("No tracks available for this playlist.");
                return;
            }

            console.log("Tracks fetched for the quiz:", data.tracks);

            // Start the quiz using the imported function
            startQuizWithPlaylist(data.tracks);
        })
        .catch(error => {
            console.error("Error fetching playlist tracks:", error);
        });
});
