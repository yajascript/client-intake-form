"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";

interface DragDropLogoZoneProps {
  description: string;
  onFileSelect: (file: File | null) => void;
  error?: string;
  initialPreview?: string;
}

export const DragDropLogoZone: React.FC<DragDropLogoZoneProps> = ({
  description,
  onFileSelect,
  error,
  initialPreview,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && !previewUrl.startsWith('http')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={`glass-input border-dashed cursor-pointer flex flex-col items-center justify-center p-8 transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-500/10" : ""
        } ${error ? "border-red-500/50" : ""}`}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="relative group rounded-xl overflow-hidden">
            <img src={previewUrl} alt="Logo preview" className="max-h-40 object-contain" />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center text-white/60">
            <UploadCloud size={40} className="mb-4 text-white/40" />
            <p className="text-sm">{description}</p>
            <p className="text-xs mt-2 text-white/40">Max 5MB (PNG, JPG, SVG, WEBP)</p>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
    </div>
  );
};
