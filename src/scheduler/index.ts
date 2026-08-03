import Metronome from "@/metronome";

const TICK_INTERVAL_PERIOD = 25; // ms
const LOOKEAD_WINDOW = 0.1; // s

export default class Scheduler {
  ctx: AudioContext | null = null;
  metronome: Metronome | null = null;
  tickInterval: ReturnType<typeof setInterval> | null = null;
  nextBeatIndex: number = 0;
  startTime: number;

  constructor(metronome: Metronome) {
    this.metronome = metronome;
  }

  scheduleBeats() {
    if (!this.ctx) {
      return;
    }

    const lookAhead = this.ctx.currentTime + LOOKEAD_WINDOW;

    const duration = this.metronome.beatDuration();

    while (this.startTime + this.nextBeatIndex * duration < lookAhead) {
      this.scheduleBeat();
    }
  }

  scheduleBeat() {
    if (!this.ctx) {
      return;
    }

    const duration = this.metronome.beatDuration();
    const beep = this.startTime + this.nextBeatIndex * duration;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.frequency.value =
      this.metronome.getPulseFromBeatIndex(this.nextBeatIndex) === 1
        ? 1200
        : 880;
    osc.connect(gainNode);

    gainNode.gain.value = this.metronome.isMuteBar(
      this.metronome.getBarFromBeatIndex(this.nextBeatIndex),
    )
      ? 0
      : 0.5;
    gainNode.connect(this.ctx.destination);

    osc.start(beep);
    osc.stop(beep + 0.3);

    this.nextBeatIndex++;
  }

  start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.startTime = this.ctx.currentTime;

    this.scheduleBeats();

    this.tickInterval = setInterval(
      () => this.scheduleBeats(),
      TICK_INTERVAL_PERIOD,
    );
  }

  stop() {
    this.nextBeatIndex = 0;
    clearInterval(this.tickInterval);
  }
}
