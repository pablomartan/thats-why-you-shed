import { describe, it, expect } from "vitest";
import Metronome from "@/metronome";

describe("Metronome", () => {
  describe("constructor", () => {
    it("creates a metronome with defaults when called without params", () => {
      const m = new Metronome();

      expect(m.timeSignature.toString()).toEqual("4/4");
      expect(m.muteBars).toBe(false);
      expect(m.bpm).toBe(60);
    });

    it("creates a metronome with the given params", () => {
      const bpm = 80;
      const timeSig = "6/8";
      const muteBars = true;

      const m = new Metronome(bpm, timeSig, muteBars);

      expect(m.bpm).toBe(bpm);
      expect(m.timeSignature.toString()).toBe(timeSig);
      expect(m.muteBars).toBe(muteBars);
    });

    it("throws when bpm is not a valid number", () => {
      expect(() => new Metronome()).not.toThrow();
      // @ts-expect-error testing bad data type
      expect(() => new Metronome("bad_data")).toThrow(TypeError);
      expect(() => new Metronome(NaN, "2/4")).toThrow(TypeError);
    });

    it("throws when time signature is invalid", () => {
      // @ts-expect-error testing bad data type
      expect(() => new Metronome(60, "bad_data")).toThrow();
    });

    it("throws when muteBars is not a boolean", () => {
      // @ts-expect-error testing bad data type
      expect(() => new Metronome(60, "2/4", "bad_data")).toThrow(TypeError);
      // @ts-expect-error testing bad data type
      expect(() => new Metronome(60, "2/4", 123)).toThrow(TypeError);
    });
  });

  describe("updateBpm", () => {
    it("updates bpm when given a valid number", () => {
      const m = new Metronome(60);
      m.updateBpm(120);
      expect(m.bpm).toBe(120);
    });

    it("does not update bpm when given NaN", () => {
      const m = new Metronome(60);
      m.updateBpm(NaN);
      expect(m.bpm).toBe(60);
    });
  });

  describe("updateTimeSignature", () => {
    it("updates to a new time signature", () => {
      const m = new Metronome(60, "4/4");
      m.updateTimeSignature("6/8");
      expect(m.timeSignature.toString()).toBe("6/8");
    });
  });

  describe("updateMuteBars", () => {
    it("updates muteBars to true", () => {
      const m = new Metronome(60, "4/4", false);
      m.updateMuteBars(true);
      expect(m.muteBars).toBe(true);
    });

    it("updates muteBars to false", () => {
      const m = new Metronome(60, "4/4", true);
      m.updateMuteBars(false);
      expect(m.muteBars).toBe(false);
    });
  });

  describe("beatDuration", () => {
    it.each([
      { bpm: 60, duration: 1 },
      { bpm: 80, duration: 0.75 },
      { bpm: 120, duration: 0.5 },
    ])(
      "returns $duration for simple time signature at $bpm bpm",
      ({ bpm, duration }) => {
        const m = new Metronome(bpm);
        expect(m.beatDuration()).toBe(duration);
      },
    );

    it.each([
      { bpm: 60, timeSig: "6/8" as const, duration: 1 / 3 },
      { bpm: 60, timeSig: "9/8" as const, duration: 1 / 3 },
      { bpm: 60, timeSig: "12/8" as const, duration: 1 / 3 },
      { bpm: 120, timeSig: "6/8" as const, duration: 1 / 6 },
    ])(
      "returns shortened duration for compound $timeSig at $bpm bpm",
      ({ bpm, timeSig, duration }) => {
        const m = new Metronome(bpm, timeSig);
        expect(m.beatDuration()).toBeCloseTo(duration, 5);
      },
    );
  });

  describe("getPulseFromBeatIndex", () => {
    it("wraps around the numerator for simple time signatures", () => {
      const m = new Metronome(60, "4/4");
      expect(m.getPulseFromBeatIndex(0)).toBe(1);
      expect(m.getPulseFromBeatIndex(1)).toBe(2);
      expect(m.getPulseFromBeatIndex(3)).toBe(4);
      expect(m.getPulseFromBeatIndex(4)).toBe(1);
      expect(m.getPulseFromBeatIndex(10)).toBe(3);
    });

    it("wraps around the numerator for compound time signatures", () => {
      const m = new Metronome(60, "9/8");
      expect(m.getPulseFromBeatIndex(0)).toBe(1);
      expect(m.getPulseFromBeatIndex(8)).toBe(9);
      expect(m.getPulseFromBeatIndex(9)).toBe(1);
      expect(m.getPulseFromBeatIndex(27)).toBe(1);
    });
  });

  describe("getBarFromBeatIndex", () => {
    it("calculates bar number for simple time signatures", () => {
      const m = new Metronome(60, "4/4");
      expect(m.getBarFromBeatIndex(0)).toBe(1);
      expect(m.getBarFromBeatIndex(3)).toBe(1);
      expect(m.getBarFromBeatIndex(4)).toBe(2);
      expect(m.getBarFromBeatIndex(10)).toBe(3);
    });

    it("calculates bar number for compound time signatures", () => {
      const m = new Metronome(60, "9/8");
      expect(m.getBarFromBeatIndex(0)).toBe(1);
      expect(m.getBarFromBeatIndex(8)).toBe(1);
      expect(m.getBarFromBeatIndex(9)).toBe(2);
      expect(m.getBarFromBeatIndex(27)).toBe(4);
    });
  });

  describe("isMuteBar", () => {
    it("returns false for all bars when muteBars is disabled", () => {
      const m = new Metronome(60, "4/4", false);

      expect(m.isMuteBar(0)).toBe(false);
      expect(m.isMuteBar(1)).toBe(false);
      expect(m.isMuteBar(2)).toBe(false);
      expect(m.isMuteBar(3)).toBe(false);
    });

    it("returns false for bar 0 regardless of muteBars setting", () => {
      const m = new Metronome(60, "4/4", true);
      expect(m.isMuteBar(0)).toBe(false);
    });

    it("returns true for every second bar when muteBars is enabled", () => {
      const m = new Metronome(60, "4/4", true);

      expect(m.isMuteBar(1)).toBe(false);
      expect(m.isMuteBar(2)).toBe(true);
      expect(m.isMuteBar(3)).toBe(false);
      expect(m.isMuteBar(4)).toBe(true);
    });
  });
});
