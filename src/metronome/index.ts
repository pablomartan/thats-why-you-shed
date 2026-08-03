import TimeSignature, { TimeSignatureFromParam } from "./time-signature";

class Metronome {
  bpm: number;
  timeSignature: TimeSignature;
  muteBars: boolean;

  constructor(
    bpm: number = 60,
    timeSignature: TimeSignatureFromParam = "4/4",
    muteBars: boolean = false,
  ) {
    if (isNaN(Number(bpm))) {
      throw new TypeError(
        "Trying to initialize metronome with invalid bpm param: " + bpm,
      );
    }

    if (muteBars.toString() !== "true" && muteBars.toString() !== "false") {
      throw new TypeError(
        "Trying to initialize metronome with invalid mute bars param: " +
          muteBars,
      );
    }

    this.bpm = bpm;
    this.timeSignature = TimeSignature.from(timeSignature);
    this.muteBars = muteBars;
  }

  beatDuration() {
    const base = 60 / this.bpm;

    return this.timeSignature.isCompound() ? base / 3 : base;
  }

  getPulseFromBeatIndex(idx: number) {
    return (idx % this.timeSignature.numerator) + 1;
  }

  getBarFromBeatIndex(idx: number) {
    return Math.floor(idx / this.timeSignature.numerator) + 1;
  }

  isMuteBar(bar: number) {
    return this.muteBars && bar > 0 && bar % (Number(this.muteBars) + 1) === 0;
  }

  updateMuteBars(checked: boolean) {
    this.muteBars = checked;
  }

  updateBpm(bpm: number) {
    if (isNaN(bpm)) {
      return;
    }

    this.bpm = bpm;
  }

  updateTimeSignature(timeSignature: TimeSignatureFromParam) {
    this.timeSignature = TimeSignature.from(timeSignature);
  }
}

export default Metronome;
