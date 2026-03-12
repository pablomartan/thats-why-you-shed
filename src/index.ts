import MetronomeAudio from "@/audio-context";
import Metronome, { TimeSignature } from "@/metronome";

let audioContext: MetronomeAudio;
let metronome: Metronome;

const init = (timeSig: TimeSignature, muteBars: number) => {
  const bpmInput = Array.from(document.getElementsByTagName("input"))[0];
  const bpmValue =
    bpmInput.value !== "" ? bpmInput.value : bpmInput.placeholder;
  const bpm = (60 / Number(bpmValue)) * 1000;

  audioContext = new MetronomeAudio();
  metronome = new Metronome({
    bpm,
    timeSig,
    muteBars,
    tickFunction: audioContext.tickSound,
    stopFunction: audioContext.stop,
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.querySelector(".c-play-button");
  const stopButton = document.querySelector(".c-stop-button");
  const timeSignatureSelect: HTMLSelectElement = document.querySelector(
    ".c-time-signature-selector",
  );
  const muteBarSelect: HTMLSelectElement = document.querySelector(
    ".c-mute-bar-selector",
  );

  playButton.addEventListener("click", () => {
    if (metronome === undefined) {
      init(
        timeSignatureSelect.value as TimeSignature,
        Number(muteBarSelect.value.split("").at(-1)),
      );
      metronome.startMetronome();
    }
  });

  stopButton.addEventListener("click", () => {
    if (audioContext) {
      metronome.stopMetronome();
      metronome = undefined;
      audioContext = undefined;
    }
  });
});
