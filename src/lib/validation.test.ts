import { describe, expect, it } from "vitest";
import { cartItemSchema, checkoutSchema } from "./validation";

describe("cart item validation", () => {
  it("accepts only the US market", () => { expect(cartItemSchema.safeParse({ variantId: "v1", market: "US", quantity: 1 }).success).toBe(true); expect(cartItemSchema.safeParse({ variantId: "v1", market: "EU", quantity: 1 }).success).toBe(false); });
  it("caps a line at five bikes", () => expect(cartItemSchema.safeParse({ variantId: "v1", market: "US", quantity: 6 }).success).toBe(false));
});

describe("checkout validation", () => {
  it("rejects malformed state and ZIP fields", () => expect(checkoutSchema.safeParse({ email: "ride@example.com", firstName: "Maya", lastName: "Torres", address1: "121 West Lake Street", city: "Chicago", state: "Illinois", postalCode: "bad", items: [{ variantId: "v1", market: "US", quantity: 1 }] }).success).toBe(false));
});
