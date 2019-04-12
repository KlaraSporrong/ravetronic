import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";

let mic;
let fft;
let energy = [];
let spectrum = [];
let t = 0;
const width = window.outerHeight;
const height = window.outerHeight;
let amplitude = 0;
let colors;
let side;
let prevLevels = new Array(60);
export default function sketch(p) {
  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {
    if (props.frequencySpectrum) {
      spectrum = props.frequencySpectrum;
    }
    if (props.rotation) {
      rotation = (props.rotation * Math.PI) / 180;
    }
    if (props.amplitude) {
      amplitude = props.amplitude;
    }
    if (props.energy) {
      energy = props.energy;
    }
  };

  // -- Amplitude over time --//

  p.setup = () => {
    p.createCanvas(width, height);
    p.background(0);
    p.noStroke();

    p.rectMode(p.CENTER);
    p.colorMode(p.HSB);
  };
  p.draw = () => {
    p.background(0);

    const amplitudeSize = p.map(amplitude * 100, 0, 1, 0, 200);
    p.fill(255);
    p.ellipse(width / 2, height / 2, amplitudeSize, amplitudeSize);

    let trebSize = p.map(energy.trebEnergy / 100, 0, 1, 0, 200);
    let midSize = p.map(energy.midEnergy / 100, 0, 1, 0, 200);
    let bassSize = p.map(energy.bassEnergy / 100, 0, 1, 0, 200);
    p.fill("rgba(0,0,255, 0.5)");
    p.ellipse(width / 6, height / 2, trebSize, trebSize);
    p.fill("rgba(0,255,0, 0.5)");
    p.ellipse((width / 6) * 3, height / 2, midSize, midSize);
    p.fill("rgba(100%,0%,100%,0.5)");
    p.ellipse((width / 6) * 6, height / 2, bassSize, bassSize);

    // rectangle variables
    var spacing = 10;
    var w = width / (prevLevels.length * spacing);

    var minHeight = 2;

    // add new level to end of array
    prevLevels.push(amplitude);

    // remove first item in array
    prevLevels.splice(0, 1);

    p.fill(255, 10);
    // loop through all the previous levels
    for (let i = 0; i < prevLevels.length; i++) {
      var x = p.map(i, prevLevels.length, 0, width / 2, width);
      var h = p.map(prevLevels[i], 0, 0.5, minHeight, height);

      var alphaValue = p.log(p.map(i, 0, prevLevels.length, 1, 250));

      var hueValue = p.map(h, minHeight, height, 200, 255);

      p.fill(hueValue, 255, 255, alphaValue);

      p.rect(x, height / 2, w, h);
      p.rect(width - x, height / 2, w, h);
    }
  };

  // --Frequency spectrum --//
  // p.setup = () => {
  //   p.createCanvas(width, height);
  //   p.noFill();
  // };

  // p.draw = () => {
  //   p.background(200);

  //   p.beginShape();
  //   for (let i = 0; i < spectrum.length; i++) {
  //     p.vertex(i, p.map(spectrum[i], 0, 255, height, 0));
  //   }
  //   p.endShape();
  // };
  // --Frequency spectrum --//

  // -- Cube -- //
  // let rotation = 0;

  // p.setup = function() {
  //   p.createCanvas(600, 400, p.WEBGL);
  // };

  // p.draw = function() {
  //   p.background(100);
  //   p.noStroke();
  //   p.push();
  //   p.rotateY(rotation);
  //   p.box(100);
  //   p.pop();
  // };
  // -- Cube -- //
}
