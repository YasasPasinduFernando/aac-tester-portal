import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, parseEmailInput } from "../../shared/email";

describe("email validation", () => {
  it("normalizes lowercase and trims whitespace", () => {
    expect(normalizeEmail("  Tester@Example.com ")).toBe("tester@example.com");
  });

  it("accepts typical Google account addresses", () => {
    expect(isValidEmail("parent.help@example.com")).toBe(true);
    expect(parseEmailInput(" Parent.Help@Example.com ")).toBe("parent.help@example.com");
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("name@.com")).toBe(false);
    expect(isValidEmail("a@b..com")).toBe(false);
    expect(parseEmailInput(123)).toBeNull();
  });
});
