import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const logSchema = z.object({
  promptText: z.string().min(1).max(2000),
  category: z.enum(["IMAGE", "VIDEO", "TEXT", "PHOTO_EDIT"]),
  redirectedTo: z.enum(["GEMINI", "CHATGPT", "PERPLEXITY"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = logSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.promptLog.create({
      data: {
        promptText: parsed.data.promptText,
        category: parsed.data.category,
        redirectedTo: parsed.data.redirectedTo ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Non-critical — fail silently for analytics
    return NextResponse.json({ success: true });
  }
}
