import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import Scheduler from "@/scheduler";
import Metronome from "@/metronome";

const createdOscillators: Array<{
  frequency: { value: number };
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
}> = [];

const createdGains: Array<{
  gain: { value: number };
  connect: ReturnType<typeof vi.fn>;
}> = [];

class MockAudioContext {
  currentTime: number;
  state: string;
  destination: AudioDestinationNode;

  constructor() {
    this.currentTime = 800;
    this.state = "running";
    this.destination = {} as AudioDestinationNode;
  }

  createOscillator() {
    const osc = {
      frequency: { value: 0 },
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
    };
    createdOscillators.push(osc);
    return osc as unknown as OscillatorNode;
  }

  createGain() {
    const gain = {
      gain: { value: 0 },
      connect: vi.fn(),
    };
    createdGains.push(gain);
    return gain as unknown as GainNode;
  }

  resume() {
    this.state = "running";
  }

  close() {}
}

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  // @ts-expect-error mocking browser API
  globalThis.AudioContext = MockAudioContext;
  createdOscillators.length = 0;
  createdGains.length = 0;
});

describe("Scheduler", () => {
  describe("constructor", () => {
    it("initializes fields — ctx, tickInterval, nextBeatIndex are null/0 and startTime is undefined", () => {
      const s = new Scheduler(new Metronome());

      expect(s.metronome).toBeInstanceOf(Metronome);
      expect(s.ctx).toBeNull();
      expect(s.tickInterval).toBeNull();
      expect(s.nextBeatIndex).toBe(0);
      expect(s.startTime).toBeUndefined();
    });
  });

  describe("start()", () => {
    it("creates an AudioContext if one does not exist", () => {
      const s = new Scheduler(new Metronome());
      expect(s.ctx).toBeNull();

      s.start();

      expect(s.ctx).toBeInstanceOf(MockAudioContext);
    });

    it("reuses an existing AudioContext when already set", () => {
      const s = new Scheduler(new Metronome());
      const existingCtx = new MockAudioContext() as unknown as AudioContext;
      s.ctx = existingCtx;

      s.start();

      expect(s.ctx).toBe(existingCtx);
    });

    it("resumes the AudioContext when suspended", () => {
      const s = new Scheduler(new Metronome());
      const ctx = new MockAudioContext();
      ctx.state = "suspended";
      s.ctx = ctx as unknown as AudioContext;

      s.start();

      expect(s.ctx.state).toBe("running");
    });

    it("sets startTime from AudioContext.currentTime", () => {
      const s = new Scheduler(new Metronome());
      const ctx = new MockAudioContext();
      ctx.currentTime = 999;
      s.ctx = ctx as unknown as AudioContext;

      s.start();

      expect(s.startTime).toBe(999);
    });

    it("schedules beats by calling into scheduleBeats", () => {
      const s = new Scheduler(new Metronome());

      s.start();

      expect(createdOscillators.length).toBeGreaterThanOrEqual(1);
    });

    it("creates a tick interval", () => {
      const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
      const s = new Scheduler(new Metronome());

      s.start();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 25);
      setIntervalSpy.mockRestore();
    });
  });

  describe("stop()", () => {
    it("resets nextBeatIndex to 0", () => {
      const s = new Scheduler(new Metronome());
      s.start();
      expect(s.nextBeatIndex).toBeGreaterThan(0);

      s.stop();

      expect(s.nextBeatIndex).toBe(0);
    });

    it("clears the tick interval", () => {
      const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
      const s = new Scheduler(new Metronome());

      s.start();
      s.stop();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe("scheduleBeats()", () => {
    it("returns early when ctx is null", () => {
      const s = new Scheduler(new Metronome());

      expect(() => s.scheduleBeats()).not.toThrow();
      expect(createdOscillators).toHaveLength(0);
    });

    it("schedules a single beat when only one fits in the lookahead", () => {
      const s = new Scheduler(new Metronome(60)); // beatDuration = 1
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 800;

      s.scheduleBeats();

      expect(createdOscillators).toHaveLength(1);
    });

    it("schedules multiple beats when several fit in the lookahead", () => {
      const s = new Scheduler(new Metronome(60)); // beatDuration = 1
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 798; // 2 seconds behind currentTime

      s.scheduleBeats();

      // lookahead = 800 + 0.1 = 800.1
      // beat 0: 798 + 0*1 = 798.0 < 800.1 ✓
      // beat 1: 798 + 1*1 = 799.0 < 800.1 ✓
      // beat 2: 798 + 2*1 = 800.0 < 800.1 ✓
      // beat 3: 798 + 3*1 = 801.0 < 800.1 ✗
      expect(createdOscillators).toHaveLength(3);
    });

    it("assigns 1200 Hz to the downbeat (pulse 1)", () => {
      const s = new Scheduler(new Metronome(60, "4/4"));
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 798;

      s.scheduleBeats();

      // beat 0: pulse = 0%4+1 = 1 → 1200 Hz
      expect(createdOscillators[0].frequency.value).toBe(1200);
    });

    it("assigns 880 Hz to offbeat pulses (pulse 2+)", () => {
      const s = new Scheduler(new Metronome(60, "4/4"));
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 798;

      s.scheduleBeats();

      // beat 1: pulse = 1%4+1 = 2 → 880 Hz
      // beat 2: pulse = 2%4+1 = 3 → 880 Hz
      expect(createdOscillators[1].frequency.value).toBe(880);
      expect(createdOscillators[2].frequency.value).toBe(880);
    });

    it("sets gain to 0.5 for non-muted bars", () => {
      const s = new Scheduler(new Metronome(60, "4/4", false));
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 798;

      s.scheduleBeats();

      expect(createdGains[0].gain.value).toBe(0.5);
      expect(createdGains[1].gain.value).toBe(0.5);
    });

    it("sets gain to 0 for muted bars", () => {
      const s = new Scheduler(new Metronome(60, "4/4", true));
      const ctx = new MockAudioContext();
      ctx.currentTime = 800;
      s.ctx = ctx as unknown as AudioContext;
      s.startTime = 795; // 5 seconds behind to reach bar 2

      s.scheduleBeats();

      // beat 0–3: bar 1, not muted
      expect(createdGains[0].gain.value).toBe(0.5);
      // beat 4: bar 2 (4/4+1=2), muted (2%2=0)
      expect(createdGains[4].gain.value).toBe(0);
    });
  });

  describe("scheduleBeat()", () => {
    it("returns early when ctx is null", () => {
      const s = new Scheduler(new Metronome());

      expect(() => s.scheduleBeat()).not.toThrow();
      expect(createdOscillators).toHaveLength(0);
      expect(s.nextBeatIndex).toBe(0);
    });

    it("increments nextBeatIndex after scheduling", () => {
      const s = new Scheduler(new Metronome());
      s.ctx = new MockAudioContext() as unknown as AudioContext;
      s.startTime = 800;

      expect(s.nextBeatIndex).toBe(0);
      s.scheduleBeat();
      expect(s.nextBeatIndex).toBe(1);
      s.scheduleBeat();
      expect(s.nextBeatIndex).toBe(2);
    });

    it("schedules beat start and stop at correct audio times", () => {
      const s = new Scheduler(new Metronome(60)); // beatDuration = 1
      s.ctx = new MockAudioContext() as unknown as AudioContext;
      s.startTime = 800;

      s.scheduleBeat();

      const osc = createdOscillators[0];
      expect(osc.start).toHaveBeenCalledWith(800); // startTime + 0 * duration
      expect(osc.stop).toHaveBeenCalledWith(800.3); // start + 0.3
    });
  });
});
