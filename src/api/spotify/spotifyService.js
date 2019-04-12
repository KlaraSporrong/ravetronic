import axios from 'axios';

function spotifyService() {
  const analyzeTrack = async (trackId, token) => {
    return axios.get(
      `https://api.spotify.com/v1/audio-analysis/${trackId}?access_token=${token}`
    );
  };

  return {
    analyzeTrack
  };
}

export default spotifyService();
