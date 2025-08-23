const bpm_input = Array.from(document.getElementsByTagName("input"))[0];
const play_button = document.querySelector(".play-button");
const stop_button = document.querySelector(".stop-button");

const audio_context = new AudioContext();
const beep = audio_context.createOscillator();
const beep_gain = audio_context.createGain();

let beepStarted = false;
let metronome;

beep.type = "sine";

const volumeDown = () => {
  beep_gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio_context.currentTime + 0.1,
  );
};

const volumeUp = () => {
  beep_gain.gain.linearRampToValueAtTime(1, audio_context.currentTime + 0.1);
};

const tick = () => {
  volumeUp();
  volumeDown();
};

const startMetronome = () => {
  if (!beepStarted) {
    beep.start();
    beepStarted = true;
  }

  beep.connect(beep_gain);
  beep_gain.connect(audio_context.destination);
  tick();

  const bpm = parseFloat(60 / bpm_input.value) * 1000;
  let i = 0;

  return setInterval(() => {
    tick();
  }, bpm);
};

const stopMetronome = () => {
  clearInterval(metronome);
  beep_gain.gain = 0;
  beep_gain.disconnect();
  metronome = undefined;
};

play_button.addEventListener("click", () => {
  metronome = startMetronome();
});

stop_button.addEventListener("click", () => {
  stopMetronome();
});
