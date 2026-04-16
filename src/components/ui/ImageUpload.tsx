"use client";

import { useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;           // current URL (empty string = nothing uploaded)
  onChange: (url: string, publicId: string) => void;
  onRemove?: () => void;
  uploading?: boolean;
  accept?: string;         // defaults to "image/*"
  label?: string;
  folder?: string;         // cloudinary folder
  hint?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  uploading = false,
  accept = "image/*",
  label,
  folder = "jadedval_foundation/uploads",
  hint,
}: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) {
      onChange(json.data.secure_url, json.data.public_id);
    }
  }

  const isVideo = value && /\.(mp4|webm|ogg|mov)$/i.test(value);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      )}

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* Preview */}
          <div className="relative flex items-center justify-center bg-gray-100" style={{ minHeight: 200 }}>
            {isVideo ? (
              <video
                src={value}
                controls
                className="max-h-64 w-full object-contain"
              />
            ) : (
              <Image
                src={value}
                alt="Upload preview"
                width={600}
                height={300}
                className="max-h-64 w-full object-contain"
                unoptimized
              />
            )}

            {/* Overlay buttons */}
            <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Change"}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Persistent action bar below preview */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2">
            <p className="truncate text-xs text-gray-400 max-w-xs">{value.split("/").pop()}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Change"}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty upload zone */
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 text-gray-400 transition hover:border-brand hover:bg-brand-lighter hover:text-brand disabled:opacity-60"
        >
          {uploading ? (
            <>
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Click to upload</span>
              {hint && <span className="text-xs">{hint}</span>}
            </>
          )}
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
