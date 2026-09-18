import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, FileText, Plus, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  uploadLabel: string;
  supportedFormats: string[];
  disabled: boolean;
  onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  uploadLabel,
  supportedFormats,
  disabled,
  onFilesSelected,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      e.target.value = ''; // reset input
    }
  };

  return (
    <div className={`relative transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.csv"
        disabled={disabled}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        disabled={disabled}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          disabled
            ? 'border-slate-200 bg-slate-100/70 text-slate-400'
            : isDragOver
            ? 'border-emerald-600 bg-emerald-50/80 shadow-md scale-[1.01]'
            : 'border-slate-300 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            disabled ? 'bg-slate-200 text-slate-400' : isDragOver ? 'bg-emerald-600 text-white' : 'bg-navy-50 text-navy-800'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-navy-900">
              📎 Drag & Drop Your Documents Here
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              or click to browse files from your computer
            </p>
          </div>

          {/* Format Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {supportedFormats.map((fmt) => (
              <span key={fmt} className="text-[11px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {fmt}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) fileInputRef.current?.click();
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-navy-800 hover:bg-navy-900 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Choose Files</span>
            </button>

            {/* Mobile Photo / Camera Button */}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) cameraInputRef.current?.click();
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Receipt Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
