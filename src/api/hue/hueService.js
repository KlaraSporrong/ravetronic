import axios from 'axios';
import { ipAddress, username } from './hueConstants.js';
const url = `http://${ipAddress}/api/${username}`;

function hueService() {
  const getLight = async lightId => {
    return axios.get(`${url}/lights/${lightId}`);
  };

  const switchLight = async (lightId, isOn, hue) => {
    return axios.put(`${url}/lights/${lightId}/state`, {
      bri: isOn ? 254 : 1,
      hue: hue
    });
  };

  const setColor = async (lightId, hue) => {
    console.log(hue);
    return axios.put(`${url}/lights/${lightId}/state`, {
      hue: hue,
      sat: 254,
      bri: 254 / 2,
      transitiontime: 0
    });
  };

  return {
    getLight,
    switchLight,
    setColor
  };
}

export default hueService();
