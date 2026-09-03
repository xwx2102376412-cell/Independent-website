import { describe, expect, it } from "vitest";
import { calculateTotals } from "./commerce";

describe("calculateTotals", () => {
  it("charges flat shipping below the threshold", () => expect(calculateTotals([{ unitPrice: 149900, quantity: 1 }])).toEqual({ subtotal: 149900, shipping: 9900, tax: 0, total: 159800 }));
  it("uses free shipping at the threshold", () => expect(calculateTotals([{ unitPrice: 75000, quantity: 2 }])).toEqual({ subtotal: 150000, shipping: 0, tax: 0, total: 150000 }));
});
