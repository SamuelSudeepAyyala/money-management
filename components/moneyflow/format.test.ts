import { describe, expect, it } from "vitest";
import { currency } from "./format";

describe("currency", () => {
  it("formats positive amounts with two decimals", () => {
    expect(currency(1234.5)).toBe("$1,234.50");
  });

  it("handles zero and negative balances", () => {
    expect(currency(0)).toBe("$0.00");
    expect(currency(-42.1)).toBe("-$42.10");
  });
});
