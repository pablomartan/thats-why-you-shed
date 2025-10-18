const SIMPLE_NUMERATORS = ["2", "3", "4"] as const;
const COMPOUND_NUMERATORS = ["6", "9", "12"] as const;

type SimpleNumerators = (typeof SIMPLE_NUMERATORS)[number];
type CompoundNumerators = (typeof COMPOUND_NUMERATORS)[number];

type TimeSignatureNumerator = SimpleNumerators | CompoundNumerators;
type TimeSignatureDenominator = "2" | "4" | "8" | "16";
export type TimeSignature =
  `${TimeSignatureNumerator}/${TimeSignatureDenominator}`;
type SimpleTimeSignature = `${SimpleNumerators}/${TimeSignatureDenominator}`;
type CompoundTimeSignature =
  `${CompoundNumerators}/${Extract<TimeSignatureDenominator, "4" | "8" | "16">}`;

const isSimpleTimeSignature = (
  timeSignature: TimeSignature,
): timeSignature is SimpleTimeSignature => {
  const numerator = timeSignature.split("/").at(0);

  return SIMPLE_NUMERATORS.some(
    (compoundNumerator) => compoundNumerator === numerator,
  );
};

const isCompoundTimeSignature = (
  timeSignature: TimeSignature,
): timeSignature is CompoundTimeSignature => {
  const numerator = timeSignature.split("/").at(0);

  return COMPOUND_NUMERATORS.some(
    (compoundNumerator) => compoundNumerator === numerator,
  );
};

export class Metronome {
  bpm: number;
  timeSig: TimeSignature;
  muteBars: number | "random";
  private currentBar: number;
  private currentPulse: number;
  private tickInterval: ReturnType<typeof setInterval>;
  private counterInterval: ReturnType<typeof setInterval>;
  tickFunction: () => void;
  stopFunction: () => void;

  constructor({
    bpm,
    timeSig,
    muteBars,
    tickFunction,
    stopFunction,
  }: Pick<
    Metronome,
    "bpm" | "timeSig" | "stopFunction" | "muteBars" | "tickFunction"
  >) {
    this.bpm = bpm;
    this.timeSig = timeSig;
    this.muteBars = muteBars;
    this.currentBar = 0;
    this.currentPulse = 1;
    this.tickFunction = tickFunction;
    this.stopFunction = stopFunction;
  }

  barCounter() {
    const numerator = Number(this.timeSig.split("/").at(0));

    const nextPulse = this.currentPulse % numerator;

    if (nextPulse === 1) {
      this.currentBar += 1;
    }

    this.currentPulse = nextPulse + 1;
  }

  startMetronome() {
    this.tickFunction();
    this.barCounter();
    this.counterInterval = setInterval(
      () => this.barCounter(),
      isCompoundTimeSignature(this.timeSig) ? this.bpm / 3 : this.bpm,
    );
    this.tickInterval = setInterval(() => this.tickFunction(), this.bpm);
  }

  stopMetronome() {
    this.stopFunction();
    clearInterval(this.tickInterval);
    clearInterval(this.counterInterval);
  }
}
