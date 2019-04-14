import React from 'react';

import styled from 'styled-components';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';

import sketch from '../P5/sketch';

import P5Wrapper from 'react-p5-wrapper';

const GifWrapper = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
`;

const GifRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  height: 33vh;
`;

const Gif = styled.div`
  opacity: ${props => (props.show ? 1 : 0)}
  width: 33%;
  height: ${props => (props.height ? props.height : '100%')};
  background-image: url(${props => props.url});
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;

`;

class Giphy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      gifUrl: '',
      opacity: 0,
      showGifFullTempo: true,
      frequencySpectrum: [],
      amplitude: 0,
      energy: {},
      color: ''
    };

    this.audioInputStreamInterval = null;
    // this.halfTempoInterval = null;
    this.fullTempoInterval = null;
    this.dubbleTempoInterval = null;
    this.gifInterval = null;
    this.bpmInterval = null;
    this.maxAmplitude = 200;
    this.minAmplitude = 1;
    this.fft = null;
    this.mic = null;
    this.amplitude = 0;

    this.colorIndex = 0;
    this.gifIndex = 0;

    // this.gifUrls = [
    //   'https://media.giphy.com/media/12PXNbcHW8C9Bm/giphy.gif',
    //   'https://media.giphy.com/media/8vtjZOUOHILz5yY9l3/giphy.gif',
    //   'https://media.giphy.com/media/vwEHGjrUdKYjKHSUuF/giphy.gif',
    //   'https://media.giphy.com/media/9nuXRx5EfGsKc/giphy.gif',
    //   'https://media.giphy.com/media/l0IyfKMG8wCXoQCuA/giphy.gif',
    //   'https://media.giphy.com/media/M5P9En3lqGNlS/giphy.gif'
    // ];
    this.hackfestUrl = 'build/hackfest.png';
    this.gifUrls = [
      'build/giphy1.gif',
      'build/giphy2.gif',
      'build/giphy3.gif',
      'build/giphy4.gif',
      'build/giphy5.gif',
      'build/giphy6.gif',
      'build/giphy7.gif',
      'build/giphy8.gif',
      'build/giphy9.gif',
      'build/giphy10.gif',
      'build/giphy11.gif'
    ];
  }

  componentDidMount() {
    this.initP5();

    this.setFullTempoInterval();
    this.setDubbleTempoInterval();
    this.setGifInterval();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tempo !== this.props.tempo) {
      clearInterval(this.halfTempoInterval);
      clearInterval(this.fullTempoInterval);
      clearInterval(this.dubbleTempoInterval);

      this.setFullTempoInterval();
      this.setDubbleTempoInterval();
      this.setGifInterval();
    }
  }

  componentWillUnmount() {
    clearInterval(this.fullTempoInterval);
    clearInterval(this.dubbleTempoInterval);
    clearInterval(this.gifInterval);
    clearInterval(this.audioInputStreamInterval);
    window.removeEventListener('resize', this.setWindowSize);
  }

  setFullTempoInterval = () => {
    this.fullTempoInterval = setInterval(
      this.handleFullTempo,
      this.props.tempo
    );
  };

  setDubbleTempoInterval = () => {
    this.dubbleTempoInterval = setInterval(
      this.handleDubbleTempo,
      this.props.tempo / 2
    );
  };

  handleFullTempo = () => {
    const showGifFullTempo = !this.state.showGifFullTempo;

    if (this.colorIndex < 6) {
      this.colorIndex++;
    } else {
      this.colorIndex = 0;
    }

    this.setState({ showGifFullTempo, colorIndex: this.colorIndex });
  };

  handleDubbleTempo = () => {
    const showGifDubbleTempo = !this.state.showGifDubbleTempo;
    this.setState({ showGifDubbleTempo });
  };

  setGifInterval = () => {
    this.gifInterval = setInterval(this.handleGifChange, this.props.tempo * 16);
  };

  handleGifChange = () => {
    if (this.gifIndex < 10) {
      this.gifIndex++;
    } else {
      this.gifIndex = 0;
    }

    this.setState({ gifUrl: this.gifUrls[this.gifIndex] });
  };

  setAudioInputStreamInterval = () => {
    this.audioInputStreamInterval = setInterval(() => {
      const frequencySpectrum = this.fft.analyze();
      const trebEnergy = this.fft.getEnergy('treble');
      const midEnergy = this.fft.getEnergy('mid');
      const bassEnergy = this.fft.getEnergy('bass');
      const amp = this.amplitude.getLevel();

      this.setState({
        frequencySpectrum,
        amplitude: amp,
        energy: { trebEnergy, midEnergy, bassEnergy }
      });
    }, 50);
  };

  initP5 = () => {
    this.mic = new p5.AudioIn();
    this.mic.start();
    this.fft = new p5.FFT();
    this.fft.setInput(this.mic);
    this.amplitude = new p5.Amplitude();
    this.amplitude.setInput(this.mic);
    // amplitude.smooth(0.5);
    this.setAudioInputStreamInterval();
  };

  // searchGifs = async () => {
  //   if (!this.state.searchTerm) {
  //     return;
  //   }

  //   const resp = await giphyService.searchGifs(this.state.searchTerm);
  //   this.setState({
  //     gifUrl: resp.data.data[0].images.original.url,
  //     gifUrls: [...resp.data.data]
  //   });
  // };

  // getTrendingGifs = async () => {
  //   const resp = await giphyService.getTrending();

  //   this.setState({
  //     gifUrl: resp.data.data[0].images.original.url,
  //     gifUrls: [...resp.data.data]
  //   });
  // };

  render() {
    return (
      !this.props.isPaused && (
        <React.Fragment>
          <P5Wrapper
            sketch={sketch}
            frequencySpectrum={this.state.frequencySpectrum}
            energy={this.state.energy}
            amplitude={this.state.amplitude}
            colorIndex={this.state.colorIndex}
          />
          <GifWrapper>
            <GifRow>
              <Gif
                show={this.state.showGifDubbleTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
              <Gif
                show={this.state.showGifFullTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
              <Gif
                show={this.state.showGifDubbleTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
            </GifRow>
            <GifRow>
              <Gif show={true} url={this.hackfestUrl} height={'180px'} />
              <Gif show={true} url={this.hackfestUrl} height={'180px'} />
              <Gif show={true} url={this.hackfestUrl} height={'180px'} />
            </GifRow>
            <GifRow>
              <Gif
                show={this.state.showGifDubbleTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
              <Gif
                show={this.state.showGifFullTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
              <Gif
                show={this.state.showGifDubbleTempo}
                url={this.state.gifUrl}
                height={'65%'}
              />
            </GifRow>
          </GifWrapper>
        </React.Fragment>
      )
    );
  }
}

export default Giphy;
