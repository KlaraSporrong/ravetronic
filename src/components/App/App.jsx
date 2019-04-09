import React, { Component } from "react";

import { isEmpty } from "lodash";
import {
  AppContainer,
  GlobalStyle,
  Input,
  Button,
  H1
} from "../../styles/global.js";

import {
  spotifyWebApiURL,
  spotifyProfileURL
} from "../../constants/app_secrets";
import axios from "axios";
import P5Wrapper from "react-p5-wrapper";

import sketch from "../sketch/sketch";

import Player from "../Player/Player.jsx";

// const keyMap = {
//   "-1": "No pitch",
//   0: "C",
//   1: "C#",
//   2: "D",
//   3: "D#",
//   4: "E",
//   5: "F",
//   6: "F#",
//   7: "G",
//   8: "G#",
//   9: "A",
//   10: "A#",
//   11: "B"
// };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authToken: "",
      profile: [],
      deviceId: null,
      user: {},
      gifUrl: "",
      gifUrls: [],
      searchTerm: "",
      rotation: 0
    };

    // this.playerCheckInterval = null;
    this.audioInputStreamInterval = null;
  }

  componentDidMount = () => {
    console.log(process.env.NODE_ENV);
    this.checkToken();
    let url = window.location.href;
    if (url.indexOf("token=") > -1) {
      let authToken = url
        .split("token=")[1]
        .split("&")[0]
        .trim();

      this.props.history.replace("/");
      this.setState({ authToken });
      window.localStorage.setItem("authToken", authToken);
    }

    // this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.authToken && this.state.authToken) {
      this.getUserInfo();
    }
  }

  componentWillUnmount() {
    // clearInterval(this.playerCheckInterval);
    clearInterval(this.audioInputStreamInterval);
  }

  // checkForPlayer() {
  //   const { authToken } = this.state;

  //   if (window.Spotify !== null && this.state.authToken) {
  //     this.player = new window.Spotify.Player({
  //       name: "RaveTronic",
  //       getOAuthToken: cb => {
  //         cb(authToken);
  //       }
  //     });
  //     this.createEventHandlers();

  //     // finally, connect!
  //     this.player.connect();

  //     clearInterval(this.playerCheckInterval);
  //     console.log("init player!");
  //   }
  // }

  // createEventHandlers() {
  //   this.player.on("initialization_error", e => {
  //     console.error(e);
  //   });
  //   this.player.on("authentication_error", e => {
  //     console.error(e);
  //     this.setState({ loggedIn: false });
  //   });
  //   this.player.on("account_error", e => {
  //     console.error(e);
  //   });
  //   this.player.on("playback_error", e => {
  //     console.error(e);
  //   });
  //   // Playback status updates
  //   this.player.on("player_state_changed", async state => {
  //     console.log(state);
  //     this.getAudioAnalysis();
  //   });

  //   // Ready
  //   this.player.on("ready", data => {
  //     let { device_id } = data;
  //     console.log("Let the music play on!");
  //     this.setState({ deviceId: device_id });
  //   });
  // }

  // getAudioAnalysis = async () => {
  //   const resp = await axios.get(
  //     `https://api.spotify.com/v1/audio-analysis/${
  //       state.track_window.current_track.id
  //     }?access_token=${this.state.authToken}`
  //   );
  //   console.log(resp.data);
  //   this.setState({
  //     trackData: resp.data.track,
  //     trackSections: resp.data.sections
  //   });
  // };
  checkToken() {
    const authToken = window.localStorage.getItem("authToken");
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

  // nextTrack = () => {
  //   this.player.nextTrack().then(() => {
  //     console.log("Skipped to next track!");
  //   });
  // };

  // prevTrack = () => {
  //   this.player.previousTrack().then(() => {
  //     console.log("Skipped to next track!");
  //   });
  // };

  // pauseTrack = () => {
  //   this.player.pause().then(() => {
  //     console.log("Skipped to next track!");
  //   });
  // };

  // resumeTrack = () => {
  //   this.player.resume().then(() => {
  //     console.log("Skipped to next track!");
  //   });
  // };

  // renderTrackSections = () => {
  //   return this.state.trackSections.map((section, index) => (
  //     <p className="display-5">{`Section ${index + 1} duration ${
  //       section.duration
  //     }`}</p>
  //   ));
  // };

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
        {this.state.authToken && !isEmpty(this.state.user) ? (
          <p>Logged in user: {this.state.user.display_name}</p>
        ) : (
          <Button type="button" color="#1DB954" onClick={this.handleAuthFlow}>
            Sign in with Spotify
          </Button>
        )}
        <Player authToken={this.state.authToken} />
        {/* <P5Wrapper sketch={sketch} rotation={this.state.rotation} />
        <Button
          onClick={() => {
            const rotation = this.state.rotation + 10;
            console.log(rotation);
            this.setState({ rotation });
          }}
        >
          Rotate
        </Button> */}

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
            <img key={gif.id} alt="gif" src={gif.images.original.url} />
          ))}
      </AppContainer>
    );
  }
}

export default App;
