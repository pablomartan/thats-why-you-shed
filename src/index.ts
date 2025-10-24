import MetronomeAudio from "@/audio-context";
import Metronome, { TimeSignature } from "@/metronome";

let audioContext: MetronomeAudio;
let metronome: Metronome;

const init = (timeSig: TimeSignature) => {
  const bpmInput = Array.from(document.getElementsByTagName("input"))[0];
  const bpm = (60 / Number(bpmInput.value)) * 1000;

  audioContext = new MetronomeAudio();
  metronome = new Metronome({
    bpm,
    timeSig,
    muteBars: 0,
    tickFunction: audioContext.tickSound,
    stopFunction: audioContext.stop,
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.querySelector(".play-button");
  const stopButton = document.querySelector(".stop-button");
  const numerator = document.querySelector(".numerator") as HTMLSelectElement;
  const denominator = document.querySelector(
    ".denominator",
  ) as HTMLSelectElement;

  playButton.addEventListener("click", () => {
    init(`${numerator.value}/${denominator.value}` as TimeSignature);
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
