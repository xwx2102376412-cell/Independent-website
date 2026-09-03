import { z } from "zod";

export const cartItemSchema = z.object({ variantId: z.string().min(1), market: z.literal("US"), quantity: z.number().int().min(1).max(5) });

export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(30).optional(),
  address1: z.string().min(3).max(150),
  address2: z.string().max(150).optional(),
  city: z.string().min(2).max(80),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  items: z.array(cartItemSchema).min(1),
});

export const inquirySchema = z.object({
  type: z.enum(["DEALER", "WHOLESALE", "CONTACT"]),
  companyName: z.string().max(120).optional(),
  contactName: z.string().min(2).max(100),
  country: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal("")),
  businessType: z.string().max(50).optional(),
  expectedQuantity: z.coerce.number().int().positive().optional(),
  interestedModels: z.array(z.string()).default([]),
  message: z.string().min(10).max(3000),
});
