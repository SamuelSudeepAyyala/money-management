import { describe, expect, it } from "vitest";
import { localDateString } from "./localDate";

describe("localDateString", () => {
  it("formats a local date without shifting it to UTC", () => {
    expect(localDateString(new Date(2026, 8, 1, 23, 59))).toBe("2026-09-01");
  });

  it("pads single-digit months and days", () => {
    expect(localDateString(new Date(2026, 0, 7))).toBe("2026-01-07");
  });
});
