import MetronomeAudio from "@/audio-context";
import Metronome, { TimeSignature } from "@/metronome";

let audioContext: MetronomeAudio;
let metronome: Metronome;

const init = (timeSig: TimeSignature, muteBars: boolean) => {
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

interface CustomCommandEvent extends Event {
  command: "--increment" | "--decrement";
}

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.querySelector(".c-play-button");
  const stopButton = document.querySelector(".c-stop-button");
  const timeSignatureSelect: HTMLSelectElement = document.querySelector(
    ".c-time-signature-selector",
  );
  const muteBarCheckbox: HTMLInputElement = document.querySelector(
    ".c-mute-bar-selector",
  );

  const numberInputs = document.querySelectorAll(
    'input[type="number"]',
  ) as NodeListOf<HTMLInputElement>;

  numberInputs.forEach((input) => {
    input.addEventListener("command", (event: CustomCommandEvent) => {
      if (event.command === "--increment") {
        input.stepUp();
      } else if (event.command === "--decrement") {
        input.stepDown();
      }
    });
  });

  playButton.addEventListener("click", () => {
    if (metronome === undefined) {
      init(timeSignatureSelect.value as TimeSignature, muteBarCheckbox.checked);
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
