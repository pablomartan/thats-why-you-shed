import { describe, it, expect } from "vitest";
import TimeSignature from "@/metronome/time-signature";

describe("TimeSignature", () => {
  it("When calling the constructor, it returns a new object with all public properties accessible", () => {
    const ts = new TimeSignature(4, 4);

    expect(ts.numerator).toBe(4);
    expect(ts.denominator).toBe(4);
    expect(typeof ts.isCompound).toBe("function");
  });

  it("When calling TimeSignature.from with '2/4', it creates a TimeSignature object with 2/4 time signature", () => {
    const ts = TimeSignature.from("2/4");

    expect(ts.numerator).toBe(2);
    expect(ts.denominator).toBe(4);
  });

  describe("TimeSignature.isCompound", () => {
    it.each([2, 3, 4, 5, 7, 8])(
      "returns false for a non-compound time signature",
      (num) => {
        const ts = new TimeSignature(num, 4);

        expect(ts.isCompound()).toBeFalsy();
      },
    );

    it.each([6, 9, 12])(
      "returns true for a non-compound time signature",
      (num) => {
        const ts = new TimeSignature(num, 8);

        expect(ts.isCompound()).toBeTruthy();
      },
    );
  });

  it("When calling TimeSignature.toString(), it returns the correct time signature string", () => {
    const tsString = "6/8";

    const ts = TimeSignature.from(tsString);

    expect(ts.toString()).toEqual(tsString);
  });
});
