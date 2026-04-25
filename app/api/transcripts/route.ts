import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transcripts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.userId, session.user.id))
      .orderBy(desc(transcripts.createdAt));

    return NextResponse.json({ transcripts: userTranscripts });
  } catch (error) {
    console.error("Fetch transcripts error:", error);
    return NextResponse.json({ error: "Failed to fetch transcripts" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "No transcript ID provided" }, { status: 400 });
    }

    const { eq: eqFn, and } = await import("drizzle-orm");
    await db
      .delete(transcripts)
      .where(
        and(
          eqFn(transcripts.id, id),
          eqFn(transcripts.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete transcript error:", error);
    return NextResponse.json({ error: "Failed to delete transcript" }, { status: 500 });
  }
}
