import React from 'react';
import giphyService from '../../api/giphy/giphyService';
import { Button, Input } from '../../styles/global.js';

class Giphy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      gifUrls: []
    };
  }
  componentDidMount() {}
  searchGifs = async () => {
    if (!this.state.searchTerm) {
      return;
    }

    const resp = await giphyService.searchGifs(this.state.searchTerm);
    this.setState({
      gifUrl: resp.data.data[0].images.original.url,
      gifUrls: [...resp.data.data]
    });
  };

  getTrendingGifs = async () => {
    const resp = await giphyService.getTrending();
    console.log(resp);
    this.setState({
      gifUrl: resp.data.data[0].images.original.url,
      gifUrls: [...resp.data.data]
    });
  };

  render() {
    return (
      <React.Fragment>
        <Input
          value={this.state.searchTerm}
          onChange={event => this.setState({ searchTerm: event.target.value })}
        />
        <Button onClick={this.searchGifs}>Search GIF</Button>
        <Button onClick={this.getTrendingGifs}>Get trending gif</Button>
        <Button onClick={() => this.setState({ gifUrls: [] })}>
          Clear gifs
        </Button>
        {this.state.gifUrls.length &&
          this.state.gifUrls.map(gif => (
            <img key={gif.id} alt='gif' src={gif.images.original.url} />
          ))}
      </React.Fragment>
    );
  }
}

export default Giphy;
