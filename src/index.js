import MetronomeAudio from "@/audio-context";
import { Metronome } from "@/metronome";

let audioContext;
let metronome;

const init = () => {
  const bpmInput = Array.from(document.getElementsByTagName("input"))[0];
  const bpm = (60 / Number(bpmInput.value)) * 1000;

  audioContext = new MetronomeAudio();
  metronome = new Metronome({
    bpm,
    timeSig: "4/4",
    muteBars: 0,
    tickFunction: () => {
      audioContext.tickSound();
    },
    startFunction: () => {
      audioContext.tickSound();
    },
    stopFunction: () => {
      audioContext.stop();
    },
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.querySelector(".play-button");
  const stopButton = document.querySelector(".stop-button");
  playButton.addEventListener("click", () => {
    init();
    metronome.startMetronome();
  });

  stopButton.addEventListener("click", () => {
    if (audioContext) {
      metronome.stopMetronome();
      metronome = undefined;
      audioContext = undefined;
    }
  });
});
