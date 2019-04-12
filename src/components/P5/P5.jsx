import React from 'react';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
import 'p5/lib/addons/p5.dom';

import P5Wrapper from 'react-p5-wrapper';

import sketch from './sketch';

class P5 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      frequencySpectrum: [],
      amplitude: 0,
      energy: {}
    };
    this.mic = null;
    this.frequencySpectrum;
    this.audioInputStreamInterval = null;
  }

  componentDidMount() {
    this.initP5();
  }

  componentWillUnmount() {
    clearInterval(this.audioInputStreamInterval);
  }
  initP5 = () => {
    this.mic = new p5.AudioIn();
    this.mic.start();
    const fft = new p5.FFT();
    fft.setInput(this.mic);
    const amplitude = new p5.Amplitude();
    amplitude.setInput(this.mic);
    // amplitude.smooth(0.5);
    this.audioInputStreamInterval = setInterval(() => {
      const frequencySpectrum = fft.analyze();
      const trebEnergy = fft.getEnergy('treble');
      const midEnergy = fft.getEnergy('mid');
      const bassEnergy = fft.getEnergy('bass');
      const amp = amplitude.getLevel();

      this.setState({
        frequencySpectrum,
        amplitude: amp,
        energy: { trebEnergy, midEnergy, bassEnergy }
      });
    }, 50);
  };
  render() {
    return (
      <P5Wrapper
        sketch={sketch}
        frequencySpectrum={this.state.frequencySpectrum}
        energy={this.state.energy}
        amplitude={this.state.amplitude}
        rotation={this.state.rotation}
      />
    );
  }
}
export default P5;
