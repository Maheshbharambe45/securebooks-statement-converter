import React from 'react';
import { ShieldCheck, ArrowDown, FileCheck, Lock, UploadCloud } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <div className="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Direct-to-Outlook Encryption • Zero Server File Storage</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight mb-4">
          Secure Bookkeeping Document <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">
            Submission Portal
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
          Securely submit your monthly or quarterly UK bookkeeping records directly to <strong className="text-white font-semibold">Secure Books</strong>. Select document categories, attach files or mark N/A, and send directly to our inbox.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-emerald-900/40 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Submit Documents Securely</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-700/60 text-left text-xs text-slate-300">
          <div className="flex items-start space-x-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">No Permanent Storage</strong>
              <span>Files erased immediately after email delivery</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">11 Categories + N/A</strong>
              <span>Flexible options for all bookkeeping items</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <UploadCloud className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Drag & Drop Upload</strong>
              <span>PDF, Excel, CSV, PNG, JPG supported</span>
            </div>
          </div>
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Mobile Camera Support</strong>
              <span>Photograph receipts directly on your phone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
