const bpmInput = Array.from(document.getElementsByTagName("input"))[0];
const playButton = document.querySelector(".play-button");
const stopButton = document.querySelector(".stop-button");

const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const oscillatorGainNode = audioContext.createGain();

oscillator.type = "sine";

let beepStarted = false;
let metronome;

const volumeDown = () => {
  oscillatorGainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + 0.1,
  );
};

const volumeUp = () => {
  oscillatorGainNode.gain.linearRampToValueAtTime(
    1,
    audioContext.currentTime + 0.1,
  );
};

const tick = () => {
  volumeUp();
  volumeDown();
};

const startMetronome = () => {
  if (!beepStarted) {
    oscillator.start();
    beepStarted = true;
  }

  if (metronome) {
    clearInterval(metronome);
  }

  oscillator.connect(oscillatorGainNode);
  oscillatorGainNode.connect(audioContext.destination);
  tick();

  const bpm = parseFloat(60 / bpmInput.value) * 1000;

  return setInterval(() => {
    tick();
  }, bpm);
};

const stopMetronome = () => {
  clearInterval(metronome);
  oscillatorGainNode.gain = 0;
  oscillatorGainNode.disconnect();
  metronome = undefined;
};

playButton.addEventListener("click", () => {
  metronome = startMetronome();
});

stopButton.addEventListener("click", () => {
  stopMetronome();
});
