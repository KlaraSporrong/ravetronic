import React, { Component } from "react";
import { spotifyWebApiURL, spotifyProfileURL } from "../../constants";
import axios from "axios";
import { isEmpty } from "lodash";

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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "React Spotify",
      authToken: "",
      authorized: false,
      profile: [],
      deviceId: null,
      user: {},
      trackData: {},
      trackSections: [],
      gifUrl: ""
    };

    this.playerCheckInterval = null;
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
    }

    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  };

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
      this.getUserInfo();
      this.setState({ deviceId: device_id });
    });
  }

  handleAuthFlow = event => {
    event.preventDefault();

    if (!this.state.authorized) {
      window.location.assign(spotifyWebApiURL);
    }
    // if (this.state.authorized) {
    //   const { authToken } = this.state;
    //   let user;
    //   axios
    //     .get(spotifyProfileURL + authToken)
    //     .then(response => {
    //       this.setState({ profile: response.data });
    //       user = response.data;
    //     })
    //     .then(() =>
    //       this.props.history.push("/react-spotify", {
    //         current_user: { user },
    //         auth: { authToken }
    //       })
    //     )
    //     .catch(error => {
    //       console.log(error);
    //       window.location.assign(spotifyWebApiURL);
    //     });
    // } else {
    //   window.location.assign(spotifyWebApiURL);
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

  searchGif = async () => {
    const searchTerm = "party";
    const resp = await axios.get(
      `https://api.giphy.com/v1/stickers/search?api_key=2xh1IKW6Nn65SDnbfcBbXuaCJXBXi1De&q=${searchTerm}`
    );
    console.log(resp);
    this.setState({ gifUrl: resp.data.data[0].embed_url });
  };
  render() {
    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <h3 className="display-4">{this.state.value}</h3>
            <hr className="my-4" />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <p className="display-5">
              {this.state.authorized
                ? "Logged in"
                : "Just click the button below to authorize your Spotify account to start using React Spotify!"}
            </p>
            {!this.state.authorized && (
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={this.handleAuthFlow}
              >
                Sign in with Spotify
              </button>
            )}
            {this.state.deviceId && (
              <p className="display-5">Device id: {this.state.deviceId}</p>
            )}
            <button onClick={this.searchGif}>Search GIF</button>
            <img alt="gif" src={this.state.gifUrl} />
            {this.state.user && this.renderPlayback()}

            <button onClick={this.prevTrack}>PREV</button>
            <button onClick={this.nextTrack}>NEXT</button>
            <button onClick={this.resumeTrack}>PLAY</button>
            <button onClick={this.pauseTrack}>PAUSE</button>
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
            <h2 className="display-5">Track sections</h2>
            <div>{this.renderTrackSections()}</div>
          </div>
        </div>
      </div>
    );
  }
}
