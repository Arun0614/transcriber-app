"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface Transcript {
  id: string;
  filename: string;
  transcript: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchTranscripts = useCallback(async () => {
    try {
      const res = await fetch("/api/transcripts");
      if (res.ok) {
        const data = await res.json();
        setTranscripts(data.transcripts || []);
      }
    } catch {
      console.error("Failed to fetch transcripts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/mp4", "audio/aac", "audio/flac", "audio/x-m4a"];
    const validExt = /\.(mp3|wav|ogg|webm|m4a|aac|flac)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !validExt) {
      setError("Please upload an audio file (MP3, WAV, OGG, WebM, M4A, AAC, FLAC)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress("Sending to Gemini AI...");

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);

      setUploadProgress("Transcribing audio...");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess("Transcription complete!");
      setSelectedFile(null);
      await fetchTranscripts();

      // Auto-expand the new transcript
      if (data.transcript?.id) {
        setExpandedId(data.transcript.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/transcripts?id=${id}`, { method: "DELETE" });
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete transcript");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          background: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "var(--accent)",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <span style={{ fontWeight: "700", fontSize: "17px", letterSpacing: "-0.3px" }}>VoiceScript</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "7px 14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "7px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontFamily: "'Syne', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "40px" }} className="animate-fade-up">
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Audio Transcription
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Upload an audio file (≤1 min) and get an instant transcript powered by Gemini AI
          </p>
        </div>

        {/* Upload Section */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "32px",
          }}
          className="animate-fade-up"
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            Upload Audio
          </h2>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!selectedFile) {
                document.getElementById("file-input")?.click();
              }
            }}
            style={{
              border: `2px dashed ${dragOver ? "var(--accent)" : selectedFile ? "var(--success)" : "var(--border)"}`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              cursor: selectedFile ? "default" : "pointer",
              transition: "all 0.2s",
              background: dragOver ? "var(--accent-glow)" : selectedFile ? "rgba(74,222,128,0.05)" : "var(--bg-elevated)",
              marginBottom: "16px",
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {selectedFile ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {selectedFile.name}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {formatFileSize(selectedFile.size)} · {selectedFile.type || "audio"}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(""); }}
                  style={{
                    marginTop: "12px",
                    padding: "5px 12px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    fontFamily: "'Syne', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ) : uploading ? (
              <div>
                {/* Waveform animation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginBottom: "16px", height: "40px" }}>
                  {[3, 6, 9, 12, 8, 5, 3].map((h, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        width: "4px",
                        height: `${h * 3}px`,
                        background: "var(--accent)",
                        borderRadius: "2px",
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "14px", color: "var(--accent)", fontWeight: "600" }}>
                  {uploadProgress}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  This may take a moment...
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: "48px", height: "48px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                </div>
                <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  <span style={{ color: "var(--accent)", fontWeight: "600" }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  MP3, WAV, OGG, WebM, M4A, AAC, FLAC · Max 10MB · Under 1 minute
                </p>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "12px",
              fontSize: "13px", color: "var(--error)",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "12px",
              fontSize: "13px", color: "var(--success)",
            }}>
              ✓ {success}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{
              padding: "11px 24px",
              background: selectedFile && !uploading ? "var(--accent)" : "var(--bg-elevated)",
              border: `1px solid ${selectedFile && !uploading ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "8px",
              color: selectedFile && !uploading ? "white" : "var(--text-muted)",
              fontSize: "14px",
              fontWeight: "600",
              fontFamily: "'Syne', sans-serif",
              cursor: selectedFile && !uploading ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {uploading ? (
              <>
                <div className="animate-spin" style={{ width: "14px", height: "14px", border: "2px solid var(--text-muted)", borderTopColor: "transparent", borderRadius: "50%" }} />
                Transcribing...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
                Transcribe Audio
              </>
            )}
          </button>
        </div>

        {/* Transcripts list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Transcripts
              {transcripts.length > 0 && (
                <span style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent-bright)",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}>
                  {transcripts.length}
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div className="animate-spin" style={{ width: "24px", height: "24px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px" }}>Loading transcripts...</p>
            </div>
          ) : transcripts.length === 0 ? (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "16px", padding: "60px 24px", textAlign: "center",
            }}>
              <div style={{
                width: "52px", height: "52px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <p style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "4px" }}>
                No transcripts yet
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Upload your first audio file to get started
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {transcripts.map((t, i) => (
                <div
                  key={t.id}
                  className="animate-fade-up"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  {/* Header row */}
                  <div
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      gap: "12px",
                    }}
                    onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div style={{
                        width: "36px", height: "36px",
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13"/>
                          <circle cx="6" cy="18" r="3"/>
                          <circle cx="18" cy="16" r="3"/>
                        </svg>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: "14px", fontWeight: "600", color: "var(--text-primary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {t.filename}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(t.transcript); }}
                        style={{
                          padding: "5px 10px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          color: "var(--text-muted)",
                          fontSize: "12px",
                          fontFamily: "'Syne', sans-serif",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "4px",
                        }}
                        title="Copy transcript"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                        style={{
                          padding: "5px 8px",
                          background: "transparent",
                          border: "1px solid transparent",
                          borderRadius: "6px",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center",
                        }}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: expandedId === t.id ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded transcript */}
                  {expandedId === t.id && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        padding: "16px 20px",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
                        TRANSCRIPT
                      </p>
                      <p style={{
                        fontSize: "14px",
                        lineHeight: "1.7",
                        color: "var(--text-primary)",
                        whiteSpace: "pre-wrap",
                      }}>
                        {t.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
