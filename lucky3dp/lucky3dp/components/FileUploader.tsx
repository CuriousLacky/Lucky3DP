"use client";

import { useState, useRef, useCallback } from "react";
import { uploadToCloudinary, validateFile } from "@/lib/cloudinary";
import { useCartStore } from "@/lib/cart-store";

type FileEntry = {
  file: File;
  preview: string;
  progress: number;
  url?: string;
  error?: string;
  status: "pending" | "uploading" | "done" | "error";
};

const MAX_FILES = 7;

export default function FileUploader() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addCustomPhotoOrder = useCartStore((s) => s.addCustomPhotoOrder);

  const photoCount = files.filter((f) => f.status === "done").length;
  const livePrice = photoCount <= 4 ? 170 : 289;
  const packLabel = photoCount <= 4 ? "4-pack" : "7-pack";

  /* ── Add & upload files ─────────────────────────────── */
  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newEntries: FileEntry[] = [];
      const remaining = MAX_FILES - files.length;

      Array.from(incoming)
        .slice(0, remaining)
        .forEach((file) => {
          const error = validateFile(file);
          const entry: FileEntry = {
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: error ? "error" : "pending",
            error: error ?? undefined,
          };
          newEntries.push(entry);
        });

      const updated = [...files, ...newEntries];
      setFiles(updated);

      // Start uploads for non-error entries
      newEntries
        .filter((e) => e.status === "pending")
        .forEach((entry) => {
          const idx = updated.indexOf(entry);
          startUpload(idx, entry.file, updated);
        });
    },
    [files]
  );

  function startUpload(index: number, file: File, currentFiles: FileEntry[]) {
    // Mark uploading
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f))
    );

    uploadToCloudinary(file, (pct) => {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: pct } : f))
      );
    })
      .then((url) => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "done", url, progress: 100 } : f
          )
        );
      })
      .catch((err) => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, status: "error", error: err.message || "Upload failed" }
              : f
          )
        );
      });
  }

  /* ── Drag & drop handlers ───────────────────────────── */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const f = prev[index];
      if (f.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  /* ── Add to cart ────────────────────────────────────── */
  function handleAddToCart() {
    const urls = files.filter((f) => f.url).map((f) => f.url!);
    if (urls.length === 0) return;

    const packType = urls.length <= 4 ? "4pack" : "7pack";
    addCustomPhotoOrder(urls, packType as "4pack" | "7pack");
    setAddedToCart(true);

    setTimeout(() => {
      setFiles([]);
      setAddedToCart(false);
    }, 2000);
  }

  const allDone = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");
  const successCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="space-y-6">
      {/* Pricing info */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`glass rounded-xl p-4 transition-all ${
            photoCount <= 4 && photoCount > 0 ? "ring-1 ring-cyan/30" : ""
          }`}
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-heading font-bold text-cyan text-lg">₹170</span>
            <span className="text-[10px] text-gray-500">up to 4 photos</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-cyan/50 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((photoCount / 4) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div
          className={`glass rounded-xl p-4 transition-all ${
            photoCount > 4 ? "ring-1 ring-cyan/30" : ""
          }`}
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-heading font-bold text-cyan text-lg">₹289</span>
            <span className="text-[10px] text-gray-500">up to 7 photos</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-cyan/50 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((photoCount - 4) / 3) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-cyan bg-cyan/5 scale-[1.01]"
            : files.length >= MAX_FILES
              ? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60"
              : "border-white/10 hover:border-cyan/30 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInput}
          disabled={files.length >= MAX_FILES}
          className="hidden"
        />

        <div className="space-y-3">
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? "bg-cyan/20" : "bg-white/5"
            }`}
          >
            <svg
              className={`w-6 h-6 transition-colors ${
                isDragging ? "text-cyan" : "text-gray-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16V4m0 0L8 8m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300">
              {isDragging ? (
                <span className="text-cyan">Drop photos here</span>
              ) : (
                <>
                  Drag & drop photos or{" "}
                  <span className="text-cyan">click to browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              JPG, PNG, WebP • Max 10MB each • Up to {MAX_FILES} photos
            </p>
          </div>
        </div>

        {/* File count badge */}
        {files.length > 0 && (
          <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-cyan/10 text-cyan font-medium">
            {files.length}/{MAX_FILES}
          </div>
        )}
      </div>

      {/* File previews with progress */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {files.map((entry, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-base-lighter border border-white/5">
                {/* Thumbnail */}
                <img
                  src={entry.preview}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Progress overlay */}
                {entry.status === "uploading" && (
                  <div className="absolute inset-0 bg-base/60 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan/30 border-t-cyan animate-spin" />
                    <span className="text-[10px] text-cyan font-medium">
                      {entry.progress}%
                    </span>
                  </div>
                )}

                {/* Done overlay */}
                {entry.status === "done" && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Error overlay */}
                {entry.status === "error" && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-lg">✕</span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {entry.status === "uploading" && (
                <div className="mt-1 w-full h-0.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-cyan rounded-full transition-all duration-300"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                ✕
              </button>

              {/* Error tooltip */}
              {entry.error && (
                <p className="text-[9px] text-red-400 mt-1 truncate">{entry.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add to Cart */}
      {files.length > 0 && (
        <div className="flex items-center justify-between glass rounded-xl p-4">
          <div>
            <p className="text-sm font-heading font-semibold">
              {successCount} photo{successCount !== 1 ? "s" : ""} —{" "}
              <span className="text-cyan">{packLabel}</span>
            </p>
            <p className="text-xs text-gray-500">
              {allDone
                ? "Ready to add to cart"
                : "Uploading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-cyan text-lg">
              ₹{livePrice}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={!allDone || successCount === 0 || addedToCart}
              className={`px-5 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : allDone && successCount > 0
                    ? "bg-cyan text-base hover:bg-cyan-dark hover:scale-[1.02]"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {addedToCart ? "✓ Added!" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
