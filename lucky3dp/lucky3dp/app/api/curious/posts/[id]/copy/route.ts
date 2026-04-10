import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.curiousPost.update({
      where: { id: params.id },
      data: { copyCount: { increment: 1 } },
    });
    return NextResponse.json({ copyCount: post.copyCount });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
