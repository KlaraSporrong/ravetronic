import React from 'react';

import { Button } from '../../styles/global.js';

import hueService from '../../api/hue/hueService.js';

class Hue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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

    this.hueBrightnessInterval = null;
  }

  componentDidMount() {
    this.initHue();
  }

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

  //   setLightBrightness = async (lightName, brightness) => {
  //     const light = { ...this.state[lightName] };
  //     hueService.setBrightness(light.id, brightness);
  //   };

  render() {
    return (
      <React.Fragment>
        <Button onClick={() => this.toggleLight('light1')}>
          Switch light 1
        </Button>
        <Button onClick={() => this.toggleLight('light2')}>
          Switch light 2
        </Button>
        <Button onClick={() => this.toggleLight('light3')}>
          Switch light 3
        </Button>
      </React.Fragment>
    );
  }
}

export default Hue;
