import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  DELHIVERY_API_TOKEN: z.string().optional().default(""),
  DELHIVERY_BASE_URL: z.string().optional().default("https://track.delhivery.com/api"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional().default("+919584604150"),
  NEXT_PUBLIC_ADSTERRA_SCRIPT_URL: z.string().optional().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default(""),
  NEXTAUTH_SECRET: z.string().optional().default("dev-secret-change-in-production"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Lazy env validation — only runs when getEnv() is called at runtime,
 * NOT during Next.js build/static generation.
 */
let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.warn("⚠️ Missing environment variables:");
    parsed.error.issues.forEach((issue) => {
      console.warn(`  → ${issue.path.join(".")}: ${issue.message}`);
    });

    // In production API routes, throw. During build, warn only.
    if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variables. Check Netlify env settings.");
    }

    // Return safe defaults for dev/build when validation fails
    return {
      MONGODB_URI: process.env.MONGODB_URI || "",
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
      DELHIVERY_API_TOKEN: process.env.DELHIVERY_API_TOKEN || "",
      DELHIVERY_BASE_URL: process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com/api",
      NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919584604150",
      NEXT_PUBLIC_ADSTERRA_SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL || "",
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
    };
  }

  _env = parsed.data;
  return _env;
}

// Backward compat — but won't crash at import time
export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
