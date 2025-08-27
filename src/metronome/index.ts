export const TimeSignature = {
  _24: "2/4",
  _34: "3/4",
  _44: "4/4",
  _38: "3/8",
  _68: "6/8",
  _98: "9/8",
} as const;

type TimeSignature = (typeof TimeSignature)[keyof typeof TimeSignature];

interface MetronomeConstructor {
  bpm: number;
  timeSig: TimeSignature;
  muteBars: number | "random";
  tickFunction: () => void;
  startFunction: () => void;
  stopFunction: () => void;
}

export class Metronome {
  bpm: number;
  timeSig: TimeSignature;
  muteBars: number | "random";
  private currentBar: number;
  private interval: ReturnType<typeof setInterval>;
  tickFunction: () => void;
  startFunction: () => void;
  stopFunction: () => void;

  constructor({
    bpm,
    timeSig,
    muteBars,
    tickFunction,
    stopFunction,
    startFunction,
  }: MetronomeConstructor) {
    this.bpm = bpm;
    this.timeSig = timeSig;
    this.muteBars = muteBars;
    this.currentBar = 1;
    this.tickFunction = tickFunction;
    this.startFunction = startFunction;
    this.stopFunction = stopFunction;
  }

  startMetronome() {
    this.startFunction();
    this.interval = setInterval(this.tickFunction, this.bpm);
  }

  stopMetronome() {
    this.stopFunction();
    clearInterval(this.interval);
  }
}
