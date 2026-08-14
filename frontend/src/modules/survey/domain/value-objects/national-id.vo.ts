import { toAsciiDigits } from "@core/text/digits";


export class NationalId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static parse(raw: string): NationalId | null {
    const digits = toAsciiDigits(raw).trim();

    if (!/^\d{10}$/.test(digits)) return null;
    // Repdigits such as "1111111111" satisfy the checksum but are not issued.
    if (/^(\d)\1{9}$/.test(digits)) return null;
    if (!NationalId.hasValidChecksum(digits)) return null;

    return new NationalId(digits);
  }

  static isValid(raw: string): boolean {
    return NationalId.parse(raw) !== null;
  }

  private static hasValidChecksum(digits: string): boolean {
    let sum = 0;
    for (let position = 0; position < 9; position += 1) {
      sum += Number(digits[position]) * (10 - position);
    }

    const remainder = sum % 11;
    const checkDigit = Number(digits[9]);

    return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
  }

  toString(): string {
    return this.value;
  }
}
