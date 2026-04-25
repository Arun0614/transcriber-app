import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, error: "Disabled in production" }, { status: 403 });
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: "admin@voicescript.app",
        username: "admin",
        displayUsername: "admin",
        password: "Admin@2024!",
        name: "Admin",
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
