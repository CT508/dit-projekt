import { normalizeEan } from "./normalize-ean";

export type EanValidationResult =
  | { valid: true; normalizedEan: string }
  | { valid: false; normalizedEan: string; code: string; message: string };

export function validateEan13Checksum(ean: string): boolean {
  if (!/^\d{13}$/.test(ean)) {
    return false;
  }

  const digits = ean.split("").map(Number);
  const checkDigit = digits[12];
  const sum = digits.slice(0, 12).reduce((total, digit, index) => {
    return total + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const expected = (10 - (sum % 10)) % 10;

  return checkDigit === expected;
}

export function validateEan(input: unknown): EanValidationResult {
  const normalizedEan = normalizeEan(input);

  if (!normalizedEan) {
    return {
      valid: false,
      normalizedEan,
      code: "MISSING_EAN",
      message: "EAN is required."
    };
  }

  if (!/^\d+$/.test(normalizedEan)) {
    return {
      valid: false,
      normalizedEan,
      code: "INVALID_EAN_CHARACTERS",
      message: "EAN must contain digits only after normalization."
    };
  }

  if (normalizedEan.length !== 13) {
    return {
      valid: false,
      normalizedEan,
      code: "INVALID_EAN_LENGTH",
      message: "MVP accepts EAN-13 only."
    };
  }

  if (!validateEan13Checksum(normalizedEan)) {
    return {
      valid: false,
      normalizedEan,
      code: "INVALID_EAN_CHECKSUM",
      message: "EAN-13 checksum is invalid."
    };
  }

  return { valid: true, normalizedEan };
}

