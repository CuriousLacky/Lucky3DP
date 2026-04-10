import { z } from "zod";

/* ─── Indian States ───────────────────────────────────── */

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

/* ─── Zod Schema ──────────────────────────────────────── */

export const shippingSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(46, "Max 46 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(46, "Max 46 characters"),
  pinCode: z
    .string()
    .length(6, "PIN code must be 6 digits")
    .regex(/^\d{6}$/, "PIN code must be numeric"),
  addressLine1: z
    .string()
    .min(1, "Address is required")
    .max(46, "Max 46 characters"),
  addressLine2: z
    .string()
    .max(46, "Max 46 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(1, "City is required")
    .max(251, "Max 251 characters"),
  state: z
    .string()
    .min(1, "State is required"),
  country: z.string().default("India"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z
    .string()
    .length(10, "Phone must be 10 digits")
    .regex(/^\d{10}$/, "Phone must be numeric"),
  whatsappUpdates: z.boolean().default(true),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;
