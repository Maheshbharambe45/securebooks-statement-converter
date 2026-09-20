import React from 'react';
import { FormCategoryDefinition, CategoryState, CategoryStatus } from '../types';
import { DropZone } from './DropZone';
import { FilePreviewList } from './FilePreviewList';
import { CheckCircle2, Ban, StickyNote } from 'lucide-react';

interface CategoryCardProps {
  category: FormCategoryDefinition;
  state: CategoryState;
  onStatusChange: (status: CategoryStatus) => void;
  onNotesChange: (notes: string) => void;
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onClearFiles?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  state,
  onStatusChange,
  onNotesChange,
  onFilesAdded,
  onRemoveFile,
  onClearFiles,
}) => {
  const isNA = state.status === 'na';

  const handleToggleNA = (targetStatus: CategoryStatus) => {
    if (targetStatus === 'na' && state.files.length > 0) {
      const confirmed = window.confirm(
        'Selecting N/A will remove the files currently selected for this section. Continue?'
      );
      if (!confirmed) return;
      if (onClearFiles) onClearFiles();
    }
    onStatusChange(targetStatus);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-card ${
      isNA ? 'border-slate-200 bg-slate-50/40' : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Category Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 min-w-0 w-full max-w-full">
        <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0 flex-1">
          {category.number && (
            <div className={`w-8 h-8 rounded-lg font-heading font-bold text-sm flex items-center justify-center shrink-0 mt-0.5 ${
              isNA ? 'bg-slate-200 text-slate-500' : 'bg-navy-900 text-white'
            }`}>
              {category.number}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold font-heading text-navy-900 flex flex-wrap items-center gap-2 min-w-0 [overflow-wrap:anywhere] break-words">
              <span>{category.title}</span>
              {state.files.length > 0 && !isNA && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full shrink-0">
                  {state.files.length} file{state.files.length === 1 ? '' : 's'}
                </span>
              )}
            </h3>
            {category.description && (
              <p className="text-xs text-slate-500 mt-0.5 [overflow-wrap:anywhere] break-words">{category.description}</p>
            )}
          </div>
        </div>

        {/* N/A Requirement Toggle */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shrink-0 w-full sm:w-auto">
          <label className={`cursor-pointer px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1.5 transition min-h-[38px] ${
            !isNA ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
          }`}>
            <input
              type="radio"
              name={`category_status_${category.id}`}
              checked={!isNA}
              onChange={() => handleToggleNA('has_documents')}
              className="accent-emerald-700 w-3.5 h-3.5 shrink-0"
            />
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${!isNA ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span className="truncate">I have documents</span>
          </label>

          <label className={`cursor-pointer px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1.5 transition min-h-[38px] ${
            isNA ? 'bg-white text-slate-700 shadow-xs border border-slate-300' : 'text-slate-600 hover:text-slate-900'
          }`}>
            <input
              type="radio"
              name={`category_status_${category.id}`}
              checked={isNA}
              onChange={() => handleToggleNA('na')}
              className="accent-slate-700 w-3.5 h-3.5 shrink-0"
            />
            <Ban className={`w-3.5 h-3.5 shrink-0 ${isNA ? 'text-slate-700' : 'text-slate-400'}`} />
            <span className="truncate">Not Applicable (N/A)</span>
          </label>
        </div>
      </div>

      {/* Category Content Area */}
      <div className="p-4 sm:p-5 space-y-4 min-w-0 w-full max-w-full">
        {isNA && (
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>ℹ️ Upload area inactive. Category marked as Not Applicable (N/A) — Documents not available.</span>
            <span className="font-semibold text-slate-500">N/A Active</span>
          </div>
        )}

        {/* Upload Area */}
        <DropZone
          uploadLabel={category.uploadLabel || 'Upload Documents'}
          supportedFormats={category.supportedFormats || ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP']}
          disabled={isNA}
          onFilesSelected={onFilesAdded}
        />

        {/* Selected File List */}
        {!isNA && <FilePreviewList files={state.files} onRemoveFile={onRemoveFile} />}

        {/* Notes Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center space-x-1">
            <StickyNote className="w-3.5 h-3.5 text-navy-700" />
            <span>{category.notesLabel || 'Notes for Bookkeeper'}</span>
          </label>
          <textarea
            rows={category.id === 'additional_docs' ? 4 : 2}
            placeholder="Add any notes or explanations that may be helpful to the bookkeeper..."
            value={state.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-100 transition"
          />
        </div>
      </div>
    </div>
  );
};
