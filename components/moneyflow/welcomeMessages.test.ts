import { describe, expect, it } from "vitest";
import { getWelcomeMessage, getWelcomePeriod, welcomeMessages } from "./welcomeMessages";

describe("time-aware welcome messages", () => {
  it.each([
    [4, "lateNight"],
    [5, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [16, "afternoon"],
    [17, "evening"],
    [20, "evening"],
    [21, "lateNight"],
  ])("assigns hour %s to %s", (hour, expected) => {
    expect(getWelcomePeriod(hour)).toBe(expected);
  });

  it("returns a deterministic message for the same date and name", () => {
    const date = new Date(2026, 8, 1, 18, 30);
    expect(getWelcomeMessage(date, "Sam")).toBe(getWelcomeMessage(date, "Sam"));
    expect(getWelcomeMessage(date, "Sam")).toMatch(/^Sam — /);
  });

  it("keeps every time period populated", () => {
    expect(Object.values(welcomeMessages).every(messages => messages.length >= 20)).toBe(true);
  });
});
