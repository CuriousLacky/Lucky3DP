"use client";

import { useState, useRef } from "react";
import { POST_TYPES, type PostType } from "@/lib/prompt-categories";

interface UploadedFile {
  file: File;
  preview: string;
  url?: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePostModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [postType, setPostType] = useState<PostType>("PHOTO_PROMPT");
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [beforeFile, setBeforeFile] = useState<UploadedFile | null>(null);
  const [afterFile, setAfterFile] = useState<UploadedFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const config = POST_TYPES.find((t) => t.id === postType)!;

  /* ── Upload a file to Cloudinary via our API ─────────── */
  async function uploadFile(
    file: File,
    onProgress: (pct: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "lucky3dp/curious");

    // Use XMLHttpRequest for progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/curious/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } else {
          reject(new Error("Upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(formData);
    });
  }

  /* ── Handle before/after file pick ───────────────────── */
  async function handleFileSelect(
    file: File,
    type: "before" | "after"
  ) {
    const entry: UploadedFile = {
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "uploading",
    };

    if (type === "before") setBeforeFile(entry);
    else setAfterFile(entry);

    try {
      const url = await uploadFile(file, (pct) => {
        const updated = { ...entry, progress: pct };
        if (type === "before") setBeforeFile(updated);
        else setAfterFile(updated);
      });

      const done = { ...entry, url, progress: 100, status: "done" as const };
      if (type === "before") setBeforeFile(done);
      else setAfterFile(done);
    } catch {
      const failed = { ...entry, status: "error" as const };
      if (type === "before") setBeforeFile(failed);
      else setAfterFile(failed);
    }
  }

  /* ── Handle extra media files ────────────────────────── */
  async function handleMediaFiles(files: FileList) {
    const newEntries: UploadedFile[] = Array.from(files).slice(0, 10 - mediaFiles.length).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      progress: 0,
      status: "pending" as const,
    }));

    const all = [...mediaFiles, ...newEntries];
    setMediaFiles(all);

    for (const entry of newEntries) {
      const idx = all.indexOf(entry);
      setMediaFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: "uploading" } : f));

      try {
        const url = await uploadFile(entry.file, (pct) => {
          setMediaFiles((prev) => prev.map((f, i) => i === idx ? { ...f, progress: pct } : f));
        });
        setMediaFiles((prev) => prev.map((f, i) => i === idx ? { ...f, url, progress: 100, status: "done" } : f));
      } catch {
        setMediaFiles((prev) => prev.map((f, i) => i === idx ? { ...f, status: "error" } : f));
      }
    }
  }

  /* ── Publish ─────────────────────────────────────────── */
  async function handlePublish() {
    if (!promptText.trim()) return setError("Prompt text is required");
    setPublishing(true);
    setError(null);

    try {
      const body: any = {
        authorName: authorName.trim() || "Anonymous",
        postType,
        promptText: promptText.trim(),
        description: description.trim() || undefined,
        mediaUrls: mediaFiles.filter((f) => f.url).map((f) => f.url!),
      };

      if (beforeFile?.url) body.beforeImage = beforeFile.url;
      if (afterFile?.url) body.afterImage = afterFile.url;

      const res = await fetch("/api/curious/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to publish");

      // Reset
      setStep(1);
      setPromptText("");
      setDescription("");
      setBeforeFile(null);
      setAfterFile(null);
      setMediaFiles([]);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  /* ── Remove file ─────────────────────────────────────── */
  function removeMedia(idx: number) {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const allUploaded =
    (!beforeFile || beforeFile.status === "done") &&
    (!afterFile || afterFile.status === "done") &&
    mediaFiles.every((f) => f.status === "done" || f.status === "error");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto glass rounded-3xl border border-white/[0.08]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-light/90 backdrop-blur-xl px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-heading font-bold text-base">Create Post</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-600">Step {step}/3</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* ── Step 1: Type & Prompt ─────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Post Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {POST_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPostType(type.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-heading font-medium transition-all ${
                        postType === type.id ? type.activeClass : "bg-white/[0.03] text-gray-500 hover:bg-white/[0.06]"
                      }`}
                    >
                      {type.icon} {type.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Your Name <span className="text-gray-700">(optional)</span>
                </label>
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={50}
                  placeholder="Anonymous"
                  className="w-full bg-base-lighter border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/40 placeholder-gray-600 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Prompt Text <span className="text-gold">*</span>
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Enter the AI prompt you used..."
                  className="w-full bg-base-lighter border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/40 placeholder-gray-600 resize-none transition-colors"
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">
                  {promptText.length}/5000
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">
                  Description <span className="text-gray-700">(optional)</span>
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Short description of your result..."
                  className="w-full bg-base-lighter border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/40 placeholder-gray-600 transition-colors"
                />
              </div>

              <button
                onClick={() => promptText.trim() ? setStep(2) : setError("Prompt is required")}
                className="w-full py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all"
              >
                Next: Add Media →
              </button>
            </div>
          )}

          {/* ── Step 2: Before/After + Media ─────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs text-gray-500">
                Add before & after comparison photos, or upload additional media.
              </p>

              {/* Before / After */}
              <div className="grid grid-cols-2 gap-3">
                {/* Before */}
                <div>
                  <label className="text-[10px] text-gray-500 tracking-wider uppercase block mb-1.5">
                    Before
                  </label>
                  <input ref={beforeRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "before")}
                  />
                  {beforeFile ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-base-lighter">
                      <img src={beforeFile.preview} alt="Before" className="w-full h-full object-cover" />
                      {beforeFile.status === "uploading" && (
                        <div className="absolute inset-0 bg-base/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
                        </div>
                      )}
                      <button onClick={() => setBeforeFile(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => beforeRef.current?.click()}
                      className="w-full aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-cyan/30 flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      <span className="text-2xl">📷</span>
                      <span className="text-[10px] text-gray-600">Upload Before</span>
                    </button>
                  )}
                </div>

                {/* After */}
                <div>
                  <label className="text-[10px] text-gray-500 tracking-wider uppercase block mb-1.5">
                    After
                  </label>
                  <input ref={afterRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "after")}
                  />
                  {afterFile ? (
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-base-lighter">
                      <img src={afterFile.preview} alt="After" className="w-full h-full object-cover" />
                      {afterFile.status === "uploading" && (
                        <div className="absolute inset-0 bg-base/60 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                        </div>
                      )}
                      <button onClick={() => setAfterFile(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => afterRef.current?.click()}
                      className="w-full aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/30 flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      <span className="text-2xl">✨</span>
                      <span className="text-[10px] text-gray-600">Upload After</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Additional media */}
              <div>
                <label className="text-[10px] text-gray-500 tracking-wider uppercase block mb-1.5">
                  Additional Media <span className="text-gray-700">(optional, up to 10)</span>
                </label>
                <input ref={mediaRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden"
                  onChange={(e) => e.target.files && handleMediaFiles(e.target.files)}
                />

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {mediaFiles.map((f, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-base-lighter">
                        <img src={f.preview} alt="" className="w-full h-full object-cover" />
                        {f.status === "uploading" && (
                          <div className="absolute inset-0 bg-base/60 flex items-center justify-center">
                            <span className="text-[10px] text-cyan font-medium">{f.progress}%</span>
                          </div>
                        )}
                        <button onClick={() => removeMedia(i)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-[9px] flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {mediaFiles.length < 10 && (
                  <button
                    onClick={() => mediaRef.current?.click()}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    + Add more photos/videos
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white/5 text-sm font-heading font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all"
                >
                  Preview →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preview & Publish ─────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Preview card */}
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-base/40">
                <div className="px-4 py-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold">
                    {(authorName || "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium">{authorName || "Anonymous"}</span>
                  <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-md ${config.bgClass}`}>
                    {config.icon} {config.shortLabel}
                  </span>
                </div>

                {beforeFile?.preview && afterFile?.preview && (
                  <div className="grid grid-cols-2 gap-px">
                    <div className="relative aspect-square">
                      <img src={beforeFile.preview} alt="Before" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white">Before</span>
                    </div>
                    <div className="relative aspect-square">
                      <img src={afterFile.preview} alt="After" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white">After</span>
                    </div>
                  </div>
                )}

                <div className="px-4 py-3">
                  {description && <p className="text-xs text-gray-300 mb-1">{description}</p>}
                  <p className="text-[11px] text-gray-500 bg-base/60 rounded-lg p-2.5 border border-white/[0.04]">
                    <span className="text-[9px] text-gray-600 block mb-1">PROMPT</span>
                    {promptText.slice(0, 150)}{promptText.length > 150 ? "..." : ""}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-3 border border-red-500/20">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white/5 text-sm font-heading font-medium rounded-xl hover:bg-white/10 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !allUploaded}
                  className={`flex-1 py-3 font-heading font-semibold text-sm rounded-xl transition-all ${
                    publishing || !allUploaded
                      ? "bg-gold/50 text-base/70 cursor-wait"
                      : "bg-gold text-base hover:bg-gold-light hover:scale-[1.01]"
                  }`}
                >
                  {publishing ? "Publishing..." : "Publish Post 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
