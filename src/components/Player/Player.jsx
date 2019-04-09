import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Button, H2 } from "../../styles/global.js";

const propTypes = {
  authToken: PropTypes.string
};

const defaultProps = {};

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

class Player extends React.Component {
  constructor(props) {
    super(props);

    this.playerCheckInterval = null;
    this.player = null;

    this.state = {
      trackData: {},
      trackSections: []
    };
  }

  componentDidMount() {
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  }

  checkForPlayer() {
    const { authToken } = this.props;

    if (window.Spotify !== null && this.props.authToken) {
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
      console.log("init player!");
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
      this.getAudioAnalysis(state);
    });

    // Ready
    this.player.on("ready", data => {
      let { device_id } = data;
      console.log("Let the music play on!");
      this.setState({ deviceId: device_id });
    });
  }

  getAudioAnalysis = async state => {
    const resp = await axios.get(
      `https://api.spotify.com/v1/audio-analysis/${
        state.track_window.current_track.id
      }?access_token=${this.props.authToken}`
    );
    console.log(resp.data);
    this.setState({
      trackData: resp.data.track,
      trackSections: resp.data.sections
    });
  };

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

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.prevTrack}>PREV</Button>
        <Button onClick={this.nextTrack}>NEXT</Button>
        <Button onClick={this.resumeTrack}>PLAY</Button>
        <Button onClick={this.pauseTrack}>PAUSE</Button>
        <p>Duration: {this.state.trackData.duration}</p>
        <p>Key: {keyMap[this.state.trackData.key]}</p>
        <p>Tempo: {this.state.trackData.tempo}</p>
        <p>End of fade in: {this.state.trackData.end_of_fade_in}</p>
        <p>Start of fade out: {this.state.trackData.start_of_fade_out}</p>
        <H2>Track sections</H2>
        <div>{this.renderTrackSections()}</div>
      </React.Fragment>
    );
  }
}

Player.propTypes = propTypes;
Player.defaultProps = defaultProps;

export default Player;
