import { describe, expect, it } from "vitest";
import { answerChat } from "./chatbot";

describe("AAC portal chatbot", () => {
  it("answers join questions without claiming Google Sign-In is group membership", () => {
    const reply = answerChat("How do I join?", "en");
    expect(reply.id).toBe("join");
    expect(reply.text.toLowerCase()).not.toContain("you have joined");
    expect(reply.text.toLowerCase()).toContain("does not mean you are already in the group");
  });

  it("points Play Store questions at the public listing", () => {
    const reply = answerChat("Where do I install from Play Store?", "en");
    expect(reply.href).toContain("play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english");
  });

  it("keeps Smart AAC answers non-clinical", () => {
    const reply = answerChat("Is Smart AAC a medical diagnostic app?", "en");
    expect(reply.text.toLowerCase()).toContain("not a diagnostic");
  });

  it("answers Sinhala join questions", () => {
    const reply = answerChat("කොහොමද ලියාපදිංචි වෙන්නේ", "si");
    expect(reply.id).toBe("join");
    expect(reply.text).toContain("Check My Access");
  });
});
