type TimeSignatureNumerator = "2" | "3" | "4" | "5" | "6" | "7" | "9" | "12";
type TimeSignatureDenominator = "1" | "2" | "4" | "8" | "16";
export type TimeSignature =
  `${TimeSignatureNumerator}/${TimeSignatureDenominator}`;

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
  }: Metronome) {
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
