const scopes =
  'user-read-private+user-read-email+playlist-read-private+user-read-birthdate+user-top-read+user-read-recently-played+streaming';
const redirectURI =
  process.env.NODE_ENV === 'production'
    ? 'https://ravetronic.herokuapp.com/'
    : 'http://localhost:8080/';

export const clientID = '3ca17dfa839b4544aa0a416a9eb411aa';
export const clientSecret = 'b5df65ba4bf44c33815d7682279ea98b';
export const spotifyWebApiURL = `https://accounts.spotify.com/authorize/?client_id=${clientID}&response_type=token&redirect_uri=${redirectURI}&scope=${scopes}`;
export const spotifyProfileURL = 'https://api.spotify.com/v1/me?access_token=';
export const spotifyPlaylistURL =
  'https://api.spotify.com/v1/me/playlists?access_token=';
export const spotifySearchURL = 'https://api.spotify.com/v1/search?q=';
export const spotifyArtistURL = 'https://api.spotify.com/v1/artists/';
export const spotifyAlbumURL = 'https://api.spotify.com/v1/albums/';
