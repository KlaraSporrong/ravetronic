import axios from 'axios';

function giphyService() {
  const searchGifs = async searchTerm => {
    return axios.get(
      `https://api.giphy.com/v1/stickers/search?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&q=${searchTerm}`
    );
  };

  const getTrending = async () => {
    return await axios.get(
      'https://api.giphy.com/v1/stickers/trending?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&limit=25&rating=G'
    );
  };

  return {
    searchGifs,
    getTrending
  };
}

export default giphyService();
