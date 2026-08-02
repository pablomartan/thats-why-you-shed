const VALID_NUMERATORS = [2, 3, 4, 5, 6, 7, 8, 9, 12];
const VALID_DENOMINATORS = [2, 4, 8];

type Numerator = (typeof VALID_NUMERATORS)[number];
type Denominator = (typeof VALID_DENOMINATORS)[number];

export type TimeSignatureFromParam = `${Numerator}/${Denominator}`;

export default class TimeSignature {
  readonly numerator: Numerator;
  readonly denominator: Denominator;

  constructor(num: Numerator, den: Denominator) {
    this.numerator = num;
    this.denominator = den;
  }

  static from(timeSig: TimeSignatureFromParam) {
    const [num, den] = timeSig.split("/").map(Number);

    if (isNaN(num) || isNaN(den)) {
      throw new TypeError(
        `Trying to create a time signature from wrong parameter: ${timeSig}`,
      );
    }

    return new TimeSignature(num, den);
  }

  isCompound() {
    return this.numerator > 3 && this.numerator % 3 === 0;
  }
}
