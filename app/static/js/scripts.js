document.addEventListener('DOMContentLoaded', () => {
    const playlistsContainer = document.getElementById('playlists-container');
    const tracksContainer = document.getElementById('tracks-container');
    const loginButton = document.getElementById('login-button');
    const fetchButton = document.getElementById('fetch-button');

    // Display playlists dynamically
    function displayPlaylists(playlists) {
        playlistsContainer.innerHTML = ''; // Clear previous content
    
        if (playlists.length === 0) {
            playlistsContainer.innerHTML = '<p>No playlists found.</p>';
            return;
        }
    
        playlists.forEach(playlist => {
            const imageUrl = playlist.image || 'https://via.placeholder.com/50';
            const playlistDiv = document.createElement('div');
            playlistDiv.className = 'playlist';
            playlistDiv.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${imageUrl}" alt="${playlist.name || 'Unnamed Playlist'}"
                         style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                    <strong>${playlist.name || 'Untitled Playlist'}</strong>
                </div>
            `;
            playlistDiv.addEventListener('click', () => {
                displayPlaylistTracks(playlist.playlist_id);
            });
            playlistsContainer.appendChild(playlistDiv);
        });
    }

    // Fetch and display tracks for a playlist
    function displayPlaylistTracks(playlistId) {
        fetch(`/playlists/${playlistId}/tracks`)
            .then(response => response.json())
            .then(data => {
                tracksContainer.innerHTML = ''; // Clear previous tracks
                if (data.tracks.length === 0) {
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

    // Fetch playlists from the server
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
        window.location.href = '/login'; // Redirect to the login endpoint
    });

    // Handle fetch button click
    fetchButton.addEventListener('click', () => {
        fetchPlaylists();
    });

    // Check if logged in and enable fetch button
    fetch('/check-login-status') // Add a route to check login status
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
