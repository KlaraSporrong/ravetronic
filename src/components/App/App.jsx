import React, { Component } from 'react';

import { isEmpty } from 'lodash';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';

import {
  AppContainer,
  GlobalStyle,
  Input,
  Button,
  H1
} from '../../styles/global.js';

import {
  spotifyWebApiURL,
  spotifyProfileURL,
  hue
} from '../../constants/app_secrets';
import hueService from '../../api/hue/hueService.js';

import axios from 'axios';
import P5Wrapper from 'react-p5-wrapper';

import sketch from '../sketch/sketch';

import Player from '../Player/Player.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authToken: '',
      profile: [],
      deviceId: null,
      user: {},
      gifUrl: '',
      gifUrls: [],
      searchTerm: '',
      rotation: 0,
      frequencySpectrum: [],
      amplitude: 0,
      energy: {},

      light1: {
        id: 8,
        on: false
      },
      light2: {
        id: 17,
        on: false
      },
      light3: {
        id: 19,
        on: false
      }
    };
    this.mic = null;
    this.frequencySpectrum;
    this.audioInputStreamInterval = null;
    this.hueBrightnessInterval = null;
  }

  componentDidMount = () => {
    console.log(process.env.NODE_ENV);
    this.checkToken();
    let url = window.location.href;
    if (url.indexOf('token=') > -1) {
      let authToken = url
        .split('token=')[1]
        .split('&')[0]
        .trim();

      this.props.history.replace('/');
      this.setState({ authToken });
      window.localStorage.setItem('authToken', authToken);
    }
    this.initP5();

    this.initHue();
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.authToken && this.state.authToken) {
      this.getUserInfo();
    }
  }

  componentWillUnmount() {
    clearInterval(this.audioInputStreamInterval);
  }

  checkToken() {
    const authToken = window.localStorage.getItem('authToken');
    if (!authToken) {
      // this.handleAuthFlow();
    } else {
      this.setState({ authToken });
    }
  }

  handleAuthFlow = () => {
    if (!this.state.authToken) {
      window.location.assign(spotifyWebApiURL);
    }
  };

  async getUserInfo() {
    const resp = await axios.get(spotifyProfileURL + this.state.authToken);
    this.setState({ user: { ...resp.data } });
    console.log(resp.data);
  }

  searchGifs = async () => {
    if (!this.state.searchTerm) {
      return;
    }
    const resp = await axios.get(
      `https://api.giphy.com/v1/stickers/search?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&q=${
        this.state.searchTerm
      }`
    );
    console.log(resp);
    this.setState({
      gifUrl: resp.data.data[0].images.original.url,
      gifUrls: [...resp.data.data]
    });
  };

  getTrendingGifs = async () => {
    const resp = await axios.get(
      'https://api.giphy.com/v1/stickers/trending?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&limit=25&rating=G'
    );
    console.log(resp);
    this.setState({
      gifUrl: resp.data.data[0].images.original.url,
      gifUrls: [...resp.data.data]
    });
  };

  initP5 = () => {
    this.mic = new p5.AudioIn();
    this.mic.start();
    const fft = new p5.FFT();
    fft.setInput(this.mic);
    const amplitude = new p5.Amplitude();
    amplitude.setInput(this.mic);
    // amplitude.smooth(0.5);
    this.audioInputStreamInterval = setInterval(() => {
      const frequencySpectrum = fft.analyze();
      const trebEnergy = fft.getEnergy('treble');
      const midEnergy = fft.getEnergy('mid');
      const bassEnergy = fft.getEnergy('bass');
      const amp = amplitude.getLevel();

      this.setState({
        frequencySpectrum,
        amplitude: amp,
        energy: { trebEnergy, midEnergy, bassEnergy }
      });
    }, 50);
  };

  initHue = async () => {
    const { light1, light2, light3 } = this.state;
    const resp1 = await hueService.getLight(light1.id);
    const resp2 = await hueService.getLight(light2.id);
    const resp3 = await hueService.getLight(light3.id);
    console.log(resp1);
    console.log(resp2);
    console.log(resp3);

    const initLight1 = {
      ...light1,
      on: resp1.data.state.bri > 1 ? true : false
    };
    const initLight2 = {
      ...light2,
      on: resp2.data.state.bri > 1 ? true : false
    };
    const initLight3 = {
      ...light3,
      on: resp3.data.state.bri > 1 ? true : false
    };

    this.setState({
      light1: initLight1,
      light2: initLight2,
      light3: initLight3
    });

    // this.hueBrightnessInterval = setInterval(() => {
    //   console.log(this.state.energy.bassEnergy);
    //   this.setLightBrightness('light1', this.state.energy.midEnergy);
    // }, 50);
  };

  toggleLight = async lightName => {
    const light = { ...this.state[lightName] };
    const isOn = !light.on;
    light.on = isOn;
    this.setState({ [lightName]: light });
    hueService.switchLight(light.id, isOn);
  };

  setLightBrightness = async (lightName, brightness) => {
    const light = { ...this.state[lightName] };
    hueService.setBrightness(light.id, brightness);
  };

  render() {
    return (
      <AppContainer>
        <GlobalStyle />
        <H1>RaveTronic</H1>
        <Button onClick={() => this.toggleLight('light1')}>
          Switch light 1
        </Button>
        <Button onClick={() => this.toggleLight('light2')}>
          Switch light 2
        </Button>
        <Button onClick={() => this.toggleLight('light3')}>
          Switch light 3
        </Button>

        {this.state.authToken && !isEmpty(this.state.user) ? (
          <p>Logged in user: {this.state.user.display_name}</p>
        ) : (
          <Button type='button' color='#1DB954' onClick={this.handleAuthFlow}>
            Sign in with Spotify
          </Button>
        )}
        <Player authToken={this.state.authToken} />
        <P5Wrapper
          sketch={sketch}
          frequencySpectrum={this.state.frequencySpectrum}
          energy={this.state.energy}
          amplitude={this.state.amplitude}
          rotation={this.state.rotation}
        />
        <Button
          onClick={() => {
            const rotation = this.state.rotation + 10;
            console.log(rotation);
            this.setState({ rotation });
          }}
        >
          Rotate
        </Button>

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
      </AppContainer>
    );
  }
}

export default App;
