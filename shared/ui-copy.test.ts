import { LOCALES, UI_COPY } from "./ui-copy";
import { describe, expect, it } from "vitest";

describe("UI copy locales", () => {
  it("keeps the same keys for English, Sinhala, and Tamil", () => {
    const englishKeys = Object.keys(UI_COPY.en).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(UI_COPY[locale]).sort()).toEqual(englishKeys);
    }
  });

  it("does not treat Google Sign-In as group membership", () => {
    expect(UI_COPY.en.inTheGroup.toLowerCase()).not.toContain("you have joined");
    expect(UI_COPY.si.googleVerified).not.toContain("පරීක්ෂක කණ්ඩායම");
    expect(UI_COPY.ta.googleVerified).not.toContain("சோதனையாளர் குழு");
  });

  it("translates remaining chrome instead of falling back to English", () => {
    expect(UI_COPY.si.siteTitle).not.toBe(UI_COPY.en.siteTitle);
    expect(UI_COPY.ta.siteTitle).not.toBe(UI_COPY.en.siteTitle);
    expect(UI_COPY.si.adminTitle).not.toBe(UI_COPY.en.adminTitle);
    expect(UI_COPY.ta.invalidEmail).not.toBe(UI_COPY.en.invalidEmail);
  });
});
