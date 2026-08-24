const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  const email = normalizeEmail(input);
  if (!email || email.length > 254) return false;
  if (email.includes("..")) return false;
  if (email.startsWith(".") || email.endsWith(".")) return false;
  if (email.startsWith("@") || email.endsWith("@")) return false;

  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return false;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || local.length > 64) return false;
  if (!domain.includes(".") || domain.startsWith("-") || domain.endsWith("-")) {
    return false;
  }
  if (domain.startsWith(".") || domain.endsWith(".")) return false;

  return EMAIL_PATTERN.test(email);
}

export function parseEmailInput(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = normalizeEmail(input);
  return isValidEmail(email) ? email : null;
}
