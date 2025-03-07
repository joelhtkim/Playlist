document.addEventListener('DOMContentLoaded', () => {
    const tracksContainer = document.getElementById('tracks-container');
    const loginButton = document.getElementById('login-button');
    const fetchButton = document.getElementById('fetch-button');
    const startGameButton = document.getElementById('start-game-button');
    const playlistsContainer = document.getElementById('playlists-container');
    let currentPlaylistId = null;

    console.log("scripts.js is running on:", document.title);

    if (!startGameButton) {
        console.error("Start Game button not found in the DOM.");
        return;
    }

    // Handle playlist selection
    playlistsContainer.addEventListener('click', (event) => {
        const playlistDiv = event.target.closest('.playlist');
        if (playlistDiv) {
            document.querySelectorAll('.playlist').forEach(el => el.classList.remove('selected'));

            playlistDiv.classList.add('selected');

            currentPlaylistId = playlistDiv.dataset.playlistId;
            console.log("Selected Playlist ID:", currentPlaylistId);

            startGameButton.disabled = false;

            displayPlaylistTracks(currentPlaylistId);
        } else {
            console.error("No playlist found or clicked element is not a playlist.");
        }
    });

    // Handle "Start Game" button click
    startGameButton.addEventListener('click', () => {
        if (!currentPlaylistId) {
            alert("Please select a playlist first!");
            return;
        }

        console.log("Redirecting to quiz page with Playlist ID:", currentPlaylistId);
        window.location.href = `/quiz/${currentPlaylistId}`;
    });

    // Function to display playlists dynamically
    function displayPlaylists(playlists) {
        playlistsContainer.innerHTML = ''; 

        if (playlists.length === 0) {
            playlistsContainer.innerHTML = '<p>No playlists found.</p>';
            return;
        }

        playlists.forEach(playlist => {
            const imageUrl = playlist.image || 'https://via.placeholder.com/50';
            const playlistDiv = document.createElement('div');
            playlistDiv.className = 'playlist';
            playlistDiv.dataset.playlistId = playlist.playlist_id; 
            playlistDiv.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${imageUrl}" alt="${playlist.name || 'Unnamed Playlist'}"
                         style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                    <strong>${playlist.name || 'Untitled Playlist'}</strong>
                </div>
            `;
            playlistsContainer.appendChild(playlistDiv);
        });
    }

    // Function to display tracks for a playlist
    function displayPlaylistTracks(playlistId) {
        fetch(`/playlists/${playlistId}/tracks`)
            .then(response => response.json())
            .then(data => {
                tracksContainer.innerHTML = ''; 

                if (!data.tracks || data.tracks.length === 0) {
                    tracksContainer.innerHTML = '<p>No tracks found.</p>';
                    return;
                }

                data.tracks.forEach(track => {
                    const trackDiv = document.createElement('div');
                    trackDiv.className = 'track';
                    trackDiv.innerHTML = `
                        <img src="${track.album_image}" alt="${track.album}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;">
                        <strong>${track.name}</strong><br>
                        <em>${track.artist}</em> - ${track.album}
                        ${track.preview_url ? `<br><audio controls src="${track.preview_url}"></audio>` : ''}
                    `;
                    tracksContainer.appendChild(trackDiv);
                });
            })
            .catch(error => {
                console.error('Error fetching playlist tracks:', error);
            });
    }

    function fetchPlaylists() {
        fetch('/playlists/saved')
            .then(response => response.json())
            .then(data => {
                displayPlaylists(data.playlists);
            })
            .catch(error => {
                console.error('Error fetching playlists:', error);
            });
    }

    // Handle login button click
    loginButton.addEventListener('click', () => {
        window.location.href = '/login'; 
    });

    // Handle fetch button click
    fetchButton.addEventListener('click', () => {
        fetchPlaylists();
    });

    fetch('/check-login-status')
        .then(response => response.json())
        .then(data => {
            if (data.logged_in) {
                fetchButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
});
