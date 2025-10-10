import MetronomeAudio from "./audio-context";
import { Metronome } from "./metronome";

const bpmInput = Array.from(document.getElementsByTagName("input"))[0];
const playButton = document.querySelector(".play-button");
const stopButton = document.querySelector(".stop-button");

let audioContext;
let metronome;

const init = () => {
  const bpm = (60 / Number(bpmInput.value)) * 1000;
  const metronomeAudio = new MetronomeAudio();
  const newMetronome = new Metronome({
    bpm,
    timeSig: "4/4",
    muteBars: 0,
    tickFunction: () => {
      metronomeAudio.tickSound();
    },
    startFunction: () => {
      metronomeAudio.tickSound();
    },
    stopFunction: () => {
      metronomeAudio.stop();
    },
  });

  audioContext = metronomeAudio;
  metronome = newMetronome;
};

if (playButton) {
  playButton.addEventListener("click", () => {
    init();
    metronome.startMetronome();
  });
}

if (stopButton) {
  stopButton.addEventListener("click", () => {
    if (audioContext) {
      metronome.stopMetronome();
      metronome = undefined;
      audioContext = undefined;
    }
  });
}
