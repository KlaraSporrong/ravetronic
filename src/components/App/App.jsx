import React, { Component } from "react";
import styled from "styled-components";

import {
  spotifyWebApiURL,
  spotifyProfileURL
} from "../../constants/app_secrets";
import axios from "axios";
import P5Wrapper from "react-p5-wrapper";

import sketch from "../sketch/sketch";

import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: Helvetica;
  }
  body {
    padding: 0;
    margin: 0;
    background-color: #212121;
    
  }
  p {
    color: #e6e6e6;
  }
`;

const Button = styled.button`
  padding: 8px 24px;
  border-radius: 60px;
  font-size: 14px;
  text-transform: uppercase;
  outline: none;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 4px;
  border-style: none;
  box-shadow: 0px 0px 0px 1px gray;
  font-size: 14px;
  outline: none;
`;

const H1 = styled.h1`
  font-size: 48px;
  color: white;
`;

const H2 = styled.h2`
  font-size: 32px;
  color: white;
`;

const AppContainer = styled.div`
  padding: 20px;
`;

const keyMap = {
  "-1": "No pitch",
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authToken: "",
      authorized: false,
      profile: [],
      deviceId: null,
      user: {},
      trackData: {},
      trackSections: [],
      gifUrl: "",
      gifUrls: [],
      searchTerm: "",
      rotation: 0
    };

    this.playerCheckInterval = null;
    this.audioInputStreamInterval = null;
  }

  componentDidMount = () => {
    console.log(process.env.NODE_ENV);
    let url = window.location.href;
    if (url.indexOf("token=") > -1) {
      let authToken = url
        .split("token=")[1]
        .split("&")[0]
        .trim();
      let authorized = true;
      this.setState({ authToken, authorized });
      this.props.history.replace("/");
    }

    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  };
  componentWillUnmount() {
    clearInterval(this.audioInputStreamInterval);
    clearInterval(this.audioInputStreamInterval);
  }
  checkForPlayer() {
    const { authToken } = this.state;

    if (window.Spotify !== null && this.state.authToken) {
      this.player = new window.Spotify.Player({
        name: "RaveTronic",
        getOAuthToken: cb => {
          cb(authToken);
        }
      });
      this.createEventHandlers();

      // finally, connect!
      this.player.connect();

      clearInterval(this.playerCheckInterval);
      console.log("init!");
    }
  }

  createEventHandlers() {
    this.player.on("initialization_error", e => {
      console.error(e);
    });
    this.player.on("authentication_error", e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    this.player.on("account_error", e => {
      console.error(e);
    });
    this.player.on("playback_error", e => {
      console.error(e);
    });

    // Playback status updates
    this.player.on("player_state_changed", async state => {
      console.log(state);
      const resp = await axios.get(
        `https://api.spotify.com/v1/audio-analysis/${
          state.track_window.current_track.id
        }?access_token=${this.state.authToken}`
      );
      console.log(resp.data);
      this.setState({
        trackData: resp.data.track,
        trackSections: resp.data.sections
      });
    });

    // Ready
    this.player.on("ready", data => {
      let { device_id } = data;
      console.log("Let the music play on!");

      this.setState({ deviceId: device_id });
    });
  }

  handleAuthFlow = event => {
    event.preventDefault();

    if (!this.state.authorized) {
      window.location.assign(spotifyWebApiURL);
    }
    // if (this.state.authorized) {
    //   this.getUserInfo();
    // }
  };

  async getUserInfo() {
    const resp = await axios.get(spotifyProfileURL + this.state.authToken);
    this.setState({ user: { ...resp.data } });
    console.log(resp.data);
  }

  renderPlayback() {
    return <p className="display-5">User: {this.state.user.display_name}</p>;
  }

  nextTrack = () => {
    this.player.nextTrack().then(() => {
      console.log("Skipped to next track!");
    });
  };

  prevTrack = () => {
    this.player.previousTrack().then(() => {
      console.log("Skipped to next track!");
    });
  };

  pauseTrack = () => {
    this.player.pause().then(() => {
      console.log("Skipped to next track!");
    });
  };

  resumeTrack = () => {
    this.player.resume().then(() => {
      console.log("Skipped to next track!");
    });
  };

  renderTrackSections = () => {
    return this.state.trackSections.map((section, index) => (
      <p className="display-5">{`Section ${index + 1} duration ${
        section.duration
      }`}</p>
    ));
  };

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
      "https://api.giphy.com/v1/stickers/trending?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&limit=25&rating=G"
    );
    console.log(resp);
    this.setState({
      gifUrl: resp.data.data[0].images.original.url,
      gifUrls: [...resp.data.data]
    });
  };

  render() {
    return (
      <AppContainer>
        <GlobalStyle />
        <H1>RaveTronic</H1>

        <P5Wrapper sketch={sketch} rotation={this.state.rotation} />
        <Button
          onClick={() => {
            const rotation = this.state.rotation + 10;
            console.log(rotation);
            this.setState({ rotation });
          }}
        >
          Rotate
        </Button>
        <div className="row">
          <div className="col-12">
            <p className="display-5">
              {this.state.authorized
                ? "Logged in"
                : "Just click the Button below to authorize your Spotify account to start using React Spotify!"}
            </p>
            {!this.state.authorized && (
              <Button
                type="button"
                className="btn btn-outline-success"
                onClick={this.handleAuthFlow}
              >
                Sign in with Spotify
              </Button>
            )}
            {this.state.deviceId && (
              <p className="display-5">Device id: {this.state.deviceId}</p>
            )}
            <Input
              value={this.state.searchTerm}
              onChange={event =>
                this.setState({ searchTerm: event.target.value })
              }
            />
            <Button onClick={this.searchGifs}>Search GIF</Button>
            <Button onClick={this.getTrendingGifs}>Get trending gif</Button>
            <Button onClick={() => this.setState({ gifUrls: [] })}>
              Clear gifs
            </Button>
            {this.state.gifUrls.length &&
              this.state.gifUrls.map(gif => (
                <img key={gif.id} alt="gif" src={gif.images.original.url} />
              ))}
            {this.state.user && this.renderPlayback()}

            <Button onClick={this.prevTrack}>PREV</Button>
            <Button onClick={this.nextTrack}>NEXT</Button>
            <Button onClick={this.resumeTrack}>PLAY</Button>
            <Button onClick={this.pauseTrack}>PAUSE</Button>
            <p className="display-5">
              Duration: {this.state.trackData.duration}
            </p>
            <p className="display-5">Key: {keyMap[this.state.trackData.key]}</p>
            <p className="display-5">Tempo: {this.state.trackData.tempo}</p>
            <p className="display-5">
              End of fade in: {this.state.trackData.end_of_fade_in}
            </p>
            <p className="display-5">
              Start of fade out: {this.state.trackData.start_of_fade_out}
            </p>
            <H2 className="display-5">Track sections</H2>
            <div>{this.renderTrackSections()}</div>
          </div>
        </div>
      </AppContainer>
    );
  }
}

export default App;
