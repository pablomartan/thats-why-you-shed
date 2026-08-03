import Metronome from "./metronome";
import { TimeSignatureFromParam } from "./metronome/time-signature";
import Scheduler from "./scheduler";

interface CustomCommandEvent extends Event {
  command: "--increment" | "--decrement";
}

export function getElements() {
  const playButton = document.querySelector(".c-play-button");
  const stopButton = document.querySelector(".c-stop-button");
  const timeSignatureSelect: HTMLSelectElement = document.querySelector(
    ".c-time-signature-selector",
  );
  const muteBarCheckbox: HTMLInputElement = document.querySelector(
    ".c-mute-bar-selector",
  );

  const bpmInput: HTMLInputElement = document.querySelector("#bpm-input");

  return {
    playButton,
    stopButton,
    timeSignatureSelect,
    muteBarCheckbox,
    bpmInput,
  };
}

export function wireUi(
  elements: ReturnType<typeof getElements>,
  metronome: Metronome,
  scheduler: Scheduler,
) {
  /* Number Input */
  // add custom buttons
  elements.bpmInput.addEventListener("command", (event: CustomCommandEvent) => {
    if (event.command === "--increment") {
      elements.bpmInput.stepUp();
    } else if (event.command === "--decrement") {
      elements.bpmInput.stepDown();
    }
  });

  // update bpm on change
  elements.bpmInput.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;

    metronome.updateBpm(Number(target.value));
  });

  // update mute bars on change
  elements.muteBarCheckbox.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;

    metronome.updateMuteBars(target.checked);
  });

  // update time signature on change
  elements.timeSignatureSelect.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;

    metronome.updateTimeSignature(target.value as TimeSignatureFromParam);
  });

  elements.playButton.addEventListener("click", (e: Event) => {
    e.preventDefault();

    scheduler.start();
  });

  elements.stopButton.addEventListener("click", (e: Event) => {
    e.preventDefault();

    scheduler.stop();
  });
}

export function init() {
  const elements = getElements();
  const { bpmInput, muteBarCheckbox, timeSignatureSelect } = elements;

  const metronome = new Metronome(
    Number(bpmInput.value),
    timeSignatureSelect.value as TimeSignatureFromParam,
    muteBarCheckbox.checked,
  );

  const scheduler = new Scheduler(metronome);

  wireUi(elements, metronome, scheduler);
}

if (process.env.NODE_ENV !== "test") {
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });
}
