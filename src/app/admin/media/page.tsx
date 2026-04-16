"use client";

import { useState, useRef } from "react";
import Button from "@/components/ui/Button";
import { CloudinaryUploadResult } from "@/types";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<CloudinaryUploadResult[]>([]);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "jadedval_foundation/media");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setUploaded((prev) => [data.data, ...prev]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload and manage images for the foundation
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <Button
            loading={uploading}
            className="cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            Upload File
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {uploaded.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white">
          <div className="text-center">
            <p className="text-4xl">🖼️</p>
            <p className="mt-2 text-sm font-medium text-gray-600">
              No media uploaded yet
            </p>
            <p className="text-xs text-gray-500">
              Click &quot;Upload File&quot; to add images or videos
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {uploaded.map((file) => (
            <div
              key={file.public_id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.secure_url}
                alt={file.public_id}
                className="h-48 w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-xs text-gray-500">
                  {file.public_id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
