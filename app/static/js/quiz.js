export function startQuizWithPlaylist(tracks) {
    const audio = document.getElementById('song-audio');
    const feedbackElement = document.getElementById('feedback');
    const scoreElement = document.getElementById('score');
    const songGuessInput = document.getElementById('song-guess');
    const submitGuessButton = document.getElementById('submit-guess-button');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');

    console.log("quiz.js is running on:", document.title);

    if (!audio || !feedbackElement || !scoreElement || !songGuessInput || !submitGuessButton || !playButton || !pauseButton) {
        console.error("One or more required elements are missing in the DOM!");
        return;
    }

    let currentRound = 0; 
    const maxRounds = 5;
    let score = 0; 
    let currentTrack = null;
    let isTrackLoaded = false; 

    feedbackElement.textContent = '';
    scoreElement.textContent = '0';
    songGuessInput.value = '';
    audio.src = ''; 
    playButton.disabled = true; 

    function startNextRound() {
        if (currentRound >= maxRounds) {
            endQuiz();
            return;
        }

        const validTracks = tracks.filter(track => track.preview_url);
        if (validTracks.length === 0) {
            feedbackElement.textContent = 'No tracks with preview URLs available.';
            return;
        }

        currentTrack = validTracks[Math.floor(Math.random() * validTracks.length)];
        console.log("Selected Track:", currentTrack);

        audio.src = currentTrack.preview_url;
        audio.currentTime = 0;
        isTrackLoaded = true;
        playButton.disabled = false;

        feedbackElement.textContent = 'Press play to listen to the snippet!';
        currentRound++;
    }

    // Handle guess submission
    submitGuessButton.addEventListener('click', () => {
        const userGuess = songGuessInput.value.trim().toLowerCase();
        if (!userGuess) {
            alert("Please enter your guess!");
            return;
        }

        if (currentTrack.name.toLowerCase() === userGuess) {
            feedbackElement.textContent = 'Correct!';
            score++;
        } else {
            feedbackElement.textContent = `Incorrect! The correct answer was "${currentTrack.name}".`;
        }

        // Update score
        scoreElement.textContent = score;

        songGuessInput.value = '';

        setTimeout(() => {
            feedbackElement.textContent = '';
            startNextRound();
        }, 2000);
    });

    // Handle end of quiz
    function endQuiz() {
        feedbackElement.textContent = `Game over! Your final score: ${score}/${maxRounds}`;

        const optionsContainer = document.createElement('div');
        optionsContainer.id = 'quiz-options';

        const retryButton = document.createElement('button');
        retryButton.textContent = 'Try Again';
        retryButton.addEventListener('click', () => {
            optionsContainer.remove();
            currentRound = 0;
            score = 0;
            scoreElement.textContent = '0';
            feedbackElement.textContent = '';
            songGuessInput.value = '';
            startNextRound();
        });

        const homeButton = document.createElement('button');
        homeButton.textContent = 'Home Screen';
        homeButton.addEventListener('click', () => {
            window.location.href = '/';
        });

        optionsContainer.appendChild(retryButton);
        optionsContainer.appendChild(homeButton);

        document.getElementById('quiz-container').appendChild(optionsContainer);
    }

    // Play and pause functionality
    playButton.addEventListener('click', () => {
        if (!isTrackLoaded) {
            alert("No track is loaded! Start the next round first.");
            return;
        }

        audio.currentTime = 0;
        audio.play().catch(error => console.error("Audio playback error:", error));
        feedbackElement.textContent = 'Listening...';

        setTimeout(() => {
            audio.pause();
            feedbackElement.textContent = 'Guess the song!';
        }, 5000);
    });

    pauseButton.addEventListener('click', () => {
        audio.pause();
        feedbackElement.textContent = 'Playback paused.';
    });

    startNextRound();
}
