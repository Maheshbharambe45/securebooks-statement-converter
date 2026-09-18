import React from 'react';
import { FileText, FileSpreadsheet, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';

interface FilePreviewListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-green-700" />;
    }
    return <FileText className="w-4 h-4 text-navy-700" />;
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 flex justify-between items-center">
        <span>Selected Files ({files.length})</span>
        <span className="text-slate-400 font-normal">Total: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}</span>
      </div>

      <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition">
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {getFileIcon(file.name)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemoveFile(index)}
              className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition shrink-0 font-medium"
              title="Remove file"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
