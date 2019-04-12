import axios from 'axios';
import { ipAddress, username } from './hueConstants.js';
const url = `http://${ipAddress}/api/${username}`;

function hueService() {
  const getLight = async lightId => {
    return axios.get(`${url}/lights/${lightId}`);
  };

  const switchLight = async (lightId, isOn) => {
    return axios.put(`${url}/lights/${lightId}/state`, {
      bri: isOn ? 254 : 1,
      transitiontime: 0
    });
  };

  const setBrightness = async (lightId, brightness) => {
    return axios.put(`${url}/lights/${lightId}/state`, {
      bri: brightness,
      transitiontime: 0
    });
  };

  return {
    getLight,
    switchLight,
    setBrightness
  };
}

export default hueService();
