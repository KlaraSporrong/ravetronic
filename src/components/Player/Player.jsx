import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import spotifyService from '../../api/spotify/spotifyService.js';

import Giphy from '../Giphy/Giphy.jsx';

const propTypes = {
  authToken: PropTypes.string
};

const defaultProps = {};

const keyMap = {
  '-1': 'No pitch',
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B'
};

const CenterDiv = styled.div`
  height: 100vh;
  width: 100%;
  text-align: center;
  font-size: 100px;
  font-weight: bold;
  color: white;
  vertical-align: middle;
  line-height: 100vh;
`;

class Player extends React.Component {
  constructor(props) {
    super(props);

    this.playerCheckInterval = null;
    this.playerStateInterval = null;
    this.colorInterval = null;
    this.beatInterval = null;
    this.barsInterval = null;
    this.player = null;
    this.colorIndex = 0;
    this.colors = [0, 4000, 15000, 24000, 28000, 31000];
    this.state = {
      trackData: {},
      sections: [],
      bars: [],
      beats: [],
      segments: [],
      currentTrack: {},
      trackPosition: 0,
      trackDuration: 0,
      trackTempo: 0,
      isPaused: true,
      beat: 0,
      tempoMs: 0
    };
  }

  componentDidMount() {
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  }

  checkForPlayer() {
    const { authToken } = this.props;

    if (window.Spotify !== null && this.props.authToken) {
      this.player = new window.Spotify.Player({
        name: 'RaveTronic',
        getOAuthToken: cb => {
          cb(authToken);
        }
      });
      this.createEventHandlers();

      // finally, connect!
      this.player.connect();

      clearInterval(this.playerCheckInterval);
      console.log('init player!');
    }
  }

  createEventHandlers() {
    this.player.on('initialization_error', e => {
      console.error(e);
    });
    this.player.on('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    this.player.on('account_error', e => {
      console.error(e);
    });
    this.player.on('playback_error', e => {
      console.error(e);
    });
    // Playback status updates
    this.player.on('player_state_changed', async state => {
      console.log('state changed: ', state);
      if (!state) {
        this.setState({ trackData: {}, sections: [] });
      } else {
        if (
          this.state.currentTrack.id !== state.track_window.current_track.id
        ) {
          this.colorIndex = 0;
          clearInterval(this.beatInterval);
          clearInterval(this.barsInterval);
          clearInterval(this.colorInterval);
          this.setTrackState(state);
          this.getAudioAnalysis(state.track_window.current_track.id);
        } else {
          const isPaused = state.paused;

          this.setState({ isPaused });
        }
      }
    });

    // Ready
    this.player.on('ready', data => {
      let { device_id } = data;
      console.log('Player ready');
      this.setState({ deviceId: device_id });
    });
  }

  setTrackState(state) {
    if (!state) {
      return;
    }
    const currentTrack = state.track_window.current_track;
    const trackPosition = state.position;
    const isPaused = state.paused;
    console.log(trackPosition);
    this.setState({ currentTrack, trackPosition, isPaused });
  }

  getPlayerState = async () => {
    if (!this.player) {
      return;
    }
    const state = await this.player.getCurrentState();
    this.setTrackState(state);
  };

  getAudioAnalysis = async trackId => {
    if (!trackId) {
      return;
    }
    const resp = await spotifyService.analyzeTrack(
      trackId,
      this.props.authToken
    );

    const tempoMs = Math.round(60000 / Math.round(resp.data.track.tempo));
    console.log(tempoMs);

    this.colorInterval = setInterval(this.handleColor, tempoMs * 2);
    this.beatInterval = setInterval(this.handleBeat, tempoMs * 2);
    this.barsInterval = setInterval(this.handleBars, tempoMs);

    this.setState({
      trackData: resp.data.track,
      trackTempo: resp.data.track.tempo,
      trackDuration: resp.data.track.duration,
      sections: resp.data.sections,
      bars: resp.data.bars,
      beats: resp.data.beats,
      segments: resp.data.segments,
      tempoMs
    });

    const light3 = { ...this.state.light3 };
    if (this.state.hueInit) {
      hueService.setColor(light3.id, light3.color);
    }
    this.setState({ light3 });
  };

  handleHueInit = isInitialized => {
    this.setState({ hueInit: isInitialized });
    console.log(isInitialized);
  };

  handleBeat = () => {
    if (this.state.isPaused) {
      return;
    }
    // this.getPlayerState();
  };

  handleBars = () => {
    if (this.state.isPaused) {
      return;
    }
    // this.getPlayerState();
  };

  handleColor = () => {
    if (this.state.isPaused) {
      return;
    }
    if (this.colorIndex < 5) {
      this.colorIndex++;
    } else {
      this.colorIndex = 0;
    }
  };

  nextTrack = () => {
    this.player.nextTrack().then(() => {
      console.log('Next');
    });
  };

  prevTrack = () => {
    this.player.previousTrack().then(() => {
      console.log('Prev');
    });
  };

  pauseTrack = () => {
    this.player.pause().then(() => {
      console.log('Pause');
    });
  };

  resumeTrack = () => {
    this.player.resume().then(() => {
      console.log('Play');
    });
  };

  renderTrackSections = () => {
    return this.state.sections.map((section, index) => (
      <p key={index} className='display-5'>{`Section ${index + 1} duration ${
        section.duration
      }`}</p>
    ));
  };

  renderBars = () => {
    return this.state.beats.map(beat => {});
  };

  render() {
    return (
      <React.Fragment>
        {this.state.tempoMs ? (
          <Giphy isPaused={this.state.isPaused} tempo={this.state.tempoMs} />
        ) : (
          <CenterDiv>Ready to party!</CenterDiv>
        )}
        {/* <Button onClick={this.prevTrack}>PREV</Button>
        <Button onClick={this.nextTrack}>NEXT</Button>
        <Button onClick={this.resumeTrack}>PLAY</Button>
        <Button onClick={this.pauseTrack}>PAUSE</Button> */}
      </React.Fragment>
    );
  }
}

Player.propTypes = propTypes;
Player.defaultProps = defaultProps;

export default Player;
