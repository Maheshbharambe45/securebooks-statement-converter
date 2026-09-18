import React from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Mail, FileCheck } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  uploadPercent: number;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, uploadPercent }) => {
  if (!isOpen) return null;

  // Determine stage ticks based on progress percentage
  const isValidating = uploadPercent > 10;
  const isFilesValidated = uploadPercent > 35;
  const isGraphPrepared = uploadPercent > 70;
  const isSending = uploadPercent >= 90;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-elevated max-w-md w-full p-8 text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-6 text-navy-800 shadow-inner relative">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
        </div>

        <h3 className="text-xl font-bold font-heading text-navy-900 mb-2">Preparing Your Documents...</h3>
        <p className="text-xs text-slate-500 mb-6">Transmitting files securely to Secure Books direct-to-Outlook endpoint</p>

        {/* Upload Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1.5">
            <span>Overall Transmission Progress</span>
            <span className="text-emerald-700">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Live Step Indicators */}
        <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center space-x-3">
            {isValidating ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            )}
            <span className={isValidating ? 'font-semibold text-slate-800' : 'text-slate-500'}>
              Validating client information & bookkeeping period
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isFilesValidated ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <FileCheck className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className={isFilesValidated ? 'font-semibold text-slate-800' : 'text-slate-500'}>
              Verifying file magic bytes & MIME signatures
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isGraphPrepared ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className={isGraphPrepared ? 'font-semibold text-slate-800' : 'text-slate-500'}>
              Preparing Microsoft Graph attachment upload sessions
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isSending ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className={isSending ? 'font-semibold text-emerald-800' : 'text-slate-500'}>
              Sending documents to info@securebooks.co.uk...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
