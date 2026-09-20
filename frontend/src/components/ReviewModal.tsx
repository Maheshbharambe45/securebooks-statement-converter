import React from 'react';
import { ClientInfo, CategoryState } from '../types';
import { BOOKKEEPING_FORM } from '../forms/formRegistry';
import { ShieldCheck, CheckCircle2, Ban, FileText, X } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  clientInfo: ClientInfo;
  categories: Record<string, CategoryState>;
  additionalNotes: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  clientInfo,
  categories,
  additionalNotes,
}) => {
  if (!isOpen) return null;

  const totalFilesCount = Object.values(categories).reduce(
    (sum, cat) => (cat.status === 'has_documents' ? sum + cat.files.length : sum),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-elevated max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white p-5 flex justify-between items-center border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Submission Summary</h3>
              <p className="text-xs text-slate-300">Please review your submission details before sending</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-sm text-slate-700">
          {/* Client Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase">Client Name</span>
              <strong className="text-navy-900 text-sm sm:text-base [overflow-wrap:anywhere] break-words block">{clientInfo.clientName}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase">Bookkeeping Period</span>
              <strong className="text-navy-900 text-xs sm:text-sm [overflow-wrap:anywhere] break-words block">{clientInfo.bookkeepingPeriod}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase">Month / Quarter</span>
              <span className="text-slate-800 font-medium [overflow-wrap:anywhere] break-words block">{clientInfo.monthQuarter}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase">Total Attached Files</span>
              <span className="text-emerald-700 font-bold block">{totalFilesCount} Files</span>
            </div>
            {clientInfo.clientEmail && (
              <div className="col-span-1 sm:col-span-2 border-t border-slate-200 pt-2">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Contact Email</span>
                <span className="text-slate-700 [overflow-wrap:anywhere] break-words block">{clientInfo.clientEmail}</span>
              </div>
            )}
          </div>

          {/* Categories Summary List */}
          <div>
            <h4 className="font-bold text-navy-900 mb-3 flex items-center justify-between">
              <span>Document Summary</span>
              <span className="text-xs text-slate-400 font-normal">{BOOKKEEPING_FORM.categories.length} Categories</span>
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {BOOKKEEPING_FORM.categories.map((cat) => {
                const catState = categories[cat.id] || { status: 'na', files: [], notes: '' };
                const isNA = catState.status === 'na';

                return (
                  <div key={cat.id} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-slate-50">
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 text-xs sm:text-sm [overflow-wrap:anywhere] break-words">{cat.title}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      {isNA ? (
                        <span className="inline-flex items-center space-x-1 text-xs bg-slate-100 text-slate-500 font-medium px-2.5 py-1 rounded-md">
                          <Ban className="w-3 h-3 text-slate-400" />
                          <span>Status: N/A</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{catState.files.length} file{catState.files.length === 1 ? '' : 's'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Notes Summary */}
          {additionalNotes && additionalNotes.trim() && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <strong className="text-slate-800 block mb-1">Additional Notes for Bookkeeper:</strong>
              <p className="text-slate-700 whitespace-pre-wrap">{additionalNotes}</p>
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-100 transition"
          >
            Back to Form
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submit Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};
