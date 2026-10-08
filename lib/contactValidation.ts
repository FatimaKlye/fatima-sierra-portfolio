const PHONE_ALLOWED = /^\+?[0-9\s().-]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export const PHONE_INPUT_FILTER = /[^0-9+\s().-]/g;
export const MAX_PHONE_LENGTH = 24;

export function normalizePhone(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidPhone(value: string): boolean {
  const phone = normalizePhone(value);

  if (!phone || phone.length > MAX_PHONE_LENGTH || !PHONE_ALLOWED.test(phone)) {
    return false;
  }

  const digits = phone.replace(/\D/g, "").length;
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}
