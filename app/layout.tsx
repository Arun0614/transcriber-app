import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoiceScript — Audio Transcription",
  description: "Upload audio files and get instant transcriptions powered by Gemini AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
