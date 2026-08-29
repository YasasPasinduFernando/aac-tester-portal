import { CASE_STUDY } from "./case-study-copy";
import { LOCALES } from "./ui-copy";
import { describe, expect, it } from "vitest";

describe("case study locales", () => {
  it("keeps the same section keys and list lengths for English, Sinhala, and Tamil", () => {
    const english = CASE_STUDY.en;
    for (const locale of LOCALES) {
      const copy = CASE_STUDY[locale];
      expect(Object.keys(copy).sort()).toEqual(Object.keys(english).sort());
      expect(copy.journey.map((step) => step.id)).toEqual(english.journey.map((step) => step.id));
      expect(copy.clinical.map((point) => point.id)).toEqual(english.clinical.map((point) => point.id));
      expect(copy.boundaries).toHaveLength(english.boundaries.length);
      expect(copy.lessons).toHaveLength(english.lessons.length);
      expect(copy.future).toHaveLength(english.future.length);
      expect(Object.keys(copy.gallery).sort()).toEqual(Object.keys(english.gallery).sort());
      expect(Object.keys(copy.groups).sort()).toEqual(Object.keys(english.groups).sort());
      expect(Object.keys(copy.fieldCards).sort()).toEqual(Object.keys(english.fieldCards).sort());
    }
  });

  it("keeps clinical trust boundaries as denials, not approvals", () => {
    expect(CASE_STUDY.en.boundaries[0]).toBe("Not a diagnostic medical device.");
    expect(CASE_STUDY.en.boundaries[1]).toContain("Not Ministry of Health approved");
    expect(CASE_STUDY.en.paperBody.toLowerCase()).toContain("submission is not the same as acceptance");
    expect(CASE_STUDY.si.boundaries[0]).toContain("නොවේ");
    expect(CASE_STUDY.ta.boundaries[0]).toContain("அல்ல");
  });
});
