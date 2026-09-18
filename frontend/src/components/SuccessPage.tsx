import React from 'react';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { SubmissionResponse } from '../types';

interface SuccessPageProps {
  response: SubmissionResponse;
  clientName: string;
  bookkeepingPeriod: string;
  onReset: () => void;
  onNavigateForms?: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  response,
  clientName,
  bookkeepingPeriod,
  onReset,
  onNavigateForms,
}) => {
  return (
    <div className="flex-1 bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-elevated p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 mb-3">
          Submission Received
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          Thank you for submitting your bookkeeping documents to Secure Books. Your submission has been received successfully.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-8 space-y-2 text-xs text-slate-700">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-500 uppercase">Submission Reference</span>
            <strong className="text-emerald-800 font-mono text-sm">{response.reference || 'SB-2026-SUBMITTED'}</strong>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-500">Client Name</span>
            <span className="font-medium text-navy-900">{clientName || 'ABC Ltd'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-slate-500">Bookkeeping Period</span>
            <span className="font-medium text-slate-800">{bookkeepingPeriod || 'Specified Period'}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
            <span className="font-semibold text-slate-500">Attached Files</span>
            <span className="font-bold text-emerald-700">{response.filesCount || 0} Files Attached</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              if (onNavigateForms) {
                onNavigateForms();
              } else {
                onReset();
              }
            }}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>Return to Forms</span>
          </button>
        </div>
      </div>
    </div>
  );
};
