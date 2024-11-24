

export function startQuizWithPlaylist(tracks) {
    const audio = document.getElementById('song-audio');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');

    
    const songGuessInput = document.getElementById('song-guess');
    const submitGuessButton = document.getElementById('submit-guess-button');

    console.log("quiz.js is running on:", document.title);



    console.log("Feedback Element:", feedbackElement);
    console.log("Score Element:", scoreElement);
    console.log("Audio Element:", audio);
    console.log("Submit Guess Button:", submitGuessButton);


    if (!audio || !feedbackElement || !scoreElement || !songGuessInput || !submitGuessButton) {
        console.error("One or more required elements are missing in the DOM!");
        return;
    }

    let currentRound = 0; // Current round number
    let maxRounds = 5; // Number of rounds in the game
    let score = 0; // Player's score
    let currentTrack = null; // Current track being played

    // Reset the UI for a new game
    feedbackElement.textContent = '';
    scoreElement.textContent = '0';
    songGuessInput.value = '';

    // Function to start a round
    function playNextTrack() {
        if (currentRound >= maxRounds) {
            feedbackElement.textContent = `Game over! Your final score: ${score}/${maxRounds}`;
            return;
        }

        // Select a random track with a preview URL
        const validTracks = tracks.filter(track => track.preview_url);
        if (validTracks.length === 0) {
            feedbackElement.textContent = 'No tracks with preview URLs available.';
            return;
        }

        currentTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
        console.log("Selected Track:", currentTrack);

        // Play the track
        audio.src = currentTrack.preview_url;
        audio.currentTime = 0;
        audio.play();

        // Stop playback after 5 seconds and prompt for a guess
        setTimeout(() => {
            audio.pause();
            feedbackElement.textContent = 'Guess the song!';
        }, 5000);

        currentRound++;
    }

    // Handle guess submission
    submitGuessButton.addEventListener('click', () => {
        const userGuess = songGuessInput.value.trim().toLowerCase();
        if (!userGuess) {
            alert("Please enter your guess!");
            return;
        }

        // Check if the guess matches the current track's name
        if (currentTrack.name.toLowerCase() === userGuess) {
            feedbackElement.textContent = 'Correct!';
            score++;
        } else {
            feedbackElement.textContent = `Incorrect! The correct answer was "${currentTrack.name}".`;
        }

        // Update score
        scoreElement.textContent = score;

        // Clear input field and play the next track
        songGuessInput.value = '';
        playNextTrack();
    });

    // Start the first round
    playNextTrack();
}


// Event listeners for play and pause buttons
document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const audio = document.getElementById('song-audio');
    let isPlaying = false;

    if (playButton) {
        playButton.addEventListener('click', () => {
            if (!audio.src) {
                alert("No song loaded!");
                return;
            }
            audio.currentTime = 0;
            audio.play();
            isPlaying = true;

            // Stop playback after 5 seconds
            setTimeout(() => {
                audio.pause();
                isPlaying = false;
            }, 5000);
        });
    }

    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const submitGuessButton = document.getElementById("submit-guess-button");
    if (!submitGuessButton) {
        console.error("submitGuessButton is not found in the DOM!");
        return;
    }

    submitGuessButton.addEventListener("click", () => {
        const userGuess = document.getElementById("song-guess").value.trim();
        if (!userGuess) {
            alert("Please type a guess!");
            return;
        }
        handleSongGuess(userGuess);
    });
});




async function searchSpotify(query) {
    const token = "YOUR_ACCESS_TOKEN"; // Replace with your stored token
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        return data.tracks.items; // Array of track objects
    } catch (error) {
        console.error("Error searching Spotify:", error);
        return [];
    }
}


async function handleSongGuess(userGuess) {
    const results = await searchSpotify(userGuess);

    if (!results || results.length === 0) {
        document.getElementById("feedback").textContent = "No matches found!";
        return;
    }

    // Fuzzy matching configuration
    const fuse = new Fuse(results, {
        keys: ["name", "artists.name"], // Search by track name and artist name
        threshold: 0.3, // Match tolerance (lower is stricter)
    });

    const matches = fuse.search(userGuess);

    if (matches.length > 0) {
        const bestMatch = matches[0].item;
        document.getElementById("feedback").textContent = `Correct! The song was "${bestMatch.name}" by ${bestMatch.artists[0].name}.`;
        incrementScore();
    } else {
        document.getElementById("feedback").textContent = "Incorrect guess. Try again!";
    }
}

function incrementScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
}


