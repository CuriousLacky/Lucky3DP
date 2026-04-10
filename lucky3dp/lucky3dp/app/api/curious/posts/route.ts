import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/* ─── GET: List posts ─────────────────────────────────── */

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type"); // PHOTO_PROMPT, VIDEO_PROMPT, etc.
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

  const where: any = { isPublished: true };
  if (type && ["PHOTO_PROMPT", "VIDEO_PROMPT", "TEXT_PROMPT", "ANIMATION_PROMPT"].includes(type)) {
    where.postType = type;
  }

  const posts = await prisma.curiousPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ posts: items, nextCursor, hasMore });
}

/* ─── POST: Create post ───────────────────────────────── */

const createSchema = z.object({
  authorName: z.string().min(1).max(50).default("Anonymous"),
  postType: z.enum(["PHOTO_PROMPT", "VIDEO_PROMPT", "TEXT_PROMPT", "ANIMATION_PROMPT"]),
  promptText: z.string().min(1).max(5000),
  description: z.string().max(500).optional(),
  beforeImage: z.string().url().optional(),
  afterImage: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).max(10).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const post = await prisma.curiousPost.create({
      data: {
        authorName: parsed.data.authorName,
        postType: parsed.data.postType,
        promptText: parsed.data.promptText,
        description: parsed.data.description || "",
        beforeImage: parsed.data.beforeImage,
        afterImage: parsed.data.afterImage,
        mediaUrls: parsed.data.mediaUrls,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
