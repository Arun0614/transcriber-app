import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transcripts } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

export const maxDuration = 60;

const DEFAULT_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
].filter((model): model is string => Boolean(model));

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB for under 1 min audio)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/mp4", "audio/aac", "audio/flac", "audio/x-m4a"];
    if (!allowedTypes.includes(audioFile.type) && !audioFile.name.match(/\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i)) {
      return NextResponse.json({ error: "Invalid file type. Please upload an audio file." }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // Determine MIME type
    let mimeType = audioFile.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      const ext = audioFile.name.split(".").pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        webm: "audio/webm",
        m4a: "audio/mp4",
        aac: "audio/aac",
        flac: "audio/flac",
      };
      mimeType = mimeMap[ext || ""] || "audio/mpeg";
    }

    // Call Gemini API for transcription
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    let result: Awaited<ReturnType<ReturnType<typeof genAI.getGenerativeModel>["generateContent"]>> | null = null;
    let lastError: unknown = null;

    for (const modelName of DEFAULT_GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Please transcribe this audio file accurately. Return only the transcribed text, nothing else. If there is no speech or the audio is unclear, say 'No speech detected or audio unclear.'",
          },
        ]);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!result) {
      throw lastError instanceof Error
        ? lastError
        : new Error("No Gemini model was available for transcription.");
    }

    const transcript = result.response.text().trim();

    if (!transcript) {
      return NextResponse.json({ error: "Could not transcribe audio" }, { status: 500 });
    }

    // Store only transcript in database
    const [saved] = await db
      .insert(transcripts)
      .values({
        userId: session.user.id,
        filename: audioFile.name,
        transcript: transcript,
      })
      .returning();

    return NextResponse.json({
      success: true,
      transcript: saved,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to process audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
