import React, { Component } from 'react';

import { isEmpty } from 'lodash';

import { AppContainer, GlobalStyle, Button, H1 } from '../../styles/global.js';

import {
  spotifyWebApiURL,
  spotifyProfileURL
} from '../../constants/app_secrets';

import axios from 'axios';

import Player from '../Player/Player.jsx';
import P5 from '../P5/P5.jsx';
import Hue from '../Hue/Hue.jsx';
import Giphy from '../Giphy/Giphy.jsx';

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
      searchTerm: ''
    };
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
      const expiresIn = parseInt(url.split('expires_in=')[1]);
      let expiresAt = new Date().getTime() + expiresIn * 1000;
      console.log(expiresAt);
      this.props.history.replace('/');
      this.setState({ authToken });
      window.localStorage.setItem('authToken', authToken);
      window.localStorage.setItem('expiresAt', expiresAt);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.authToken && this.state.authToken) {
      this.getUserInfo();
    }
  }

  checkToken() {
    const authToken = window.localStorage.getItem('authToken');
    const expiresAt = window.localStorage.getItem('expiresAt');
    if (!authToken || expiresAt < new Date().getTime()) {
      window.location.assign(spotifyWebApiURL);
    } else {
      this.setState({ authToken });
    }
  }

  handleAuthFlow = () => {
    if (!this.state.authToken) {
      window.location.assign(spotifyWebApiURL);
    }
  };

  getUserInfo = async () => {
    const resp = await axios.get(spotifyProfileURL + this.state.authToken);
    this.setState({ user: { ...resp.data } });
    console.log(resp.data);
  };

  render() {
    return (
      <AppContainer>
        <GlobalStyle />
        <H1>RaveTronic</H1>

        <Hue />
        {this.state.authToken && !isEmpty(this.state.user) ? (
          <p>Logged in user: {this.state.user.display_name}</p>
        ) : (
          <Button type='button' color='#1DB954' onClick={this.handleAuthFlow}>
            Sign in with Spotify
          </Button>
        )}

        {/* ---- Spotify player ---- */}
        <Player authToken={this.state.authToken} />

        {/* ---- P5 ---- */}
        {/* <P5 /> */}

        {/* ---- GIPHY ----*/}
        <Giphy />
      </AppContainer>
    );
  }
}

export default App;
