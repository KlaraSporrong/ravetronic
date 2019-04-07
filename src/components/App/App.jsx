import React, { Component } from "react";
import { spotifyWebApiURL, spotifyProfileURL } from "../../constants";
import axios from "axios";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "React Spotify",
      authToken: "",
      authorized: false,
      profile: [],
      deviceId: null,
      user: {}
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
        name: "Klaras Spotify Player",
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
    this.player.on("player_state_changed", state => {
      console.log(state);
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
            {this.state.user && this.renderPlayback()}
          </div>
        </div>
      </div>
    );
  }
}
