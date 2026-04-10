import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sessionId } = await req.json();
    const postId = params.id;

    if (!sessionId) {
      return NextResponse.json({ error: "Session required" }, { status: 400 });
    }

    const post = await prisma.curiousPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const alreadyLiked = post.likedBy.includes(sessionId);

    if (alreadyLiked) {
      // Unlike
      await prisma.curiousPost.update({
        where: { id: postId },
        data: {
          likes: { decrement: 1 },
          likedBy: { set: post.likedBy.filter((id) => id !== sessionId) },
        },
      });
      return NextResponse.json({ liked: false, likes: post.likes - 1 });
    } else {
      // Like
      await prisma.curiousPost.update({
        where: { id: postId },
        data: {
          likes: { increment: 1 },
          likedBy: { push: sessionId },
        },
      });
      return NextResponse.json({ liked: true, likes: post.likes + 1 });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
