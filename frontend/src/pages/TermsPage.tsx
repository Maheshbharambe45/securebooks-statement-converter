import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-12 prose prose-slate w-full max-w-full">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
          <FileText className="w-8 h-8 text-navy-900 shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 m-0">
            Terms of Service
          </h1>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          Welcome to the Secure Books Document Submission Portal (<a href="https://www.securebooks.co.uk" className="text-emerald-700 hover:underline [overflow-wrap:anywhere] break-words">www.securebooks.co.uk</a>). By using our portal to submit accounting documentation, you agree to these terms.
        </p>

        <h3 className="text-lg font-bold text-navy-900 mt-6 mb-2">1. Portal Purpose</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          The portal is provided to enable clients to upload bookkeeping and accounting documents securely to Secure Books. Users are responsible for ensuring that uploaded files are accurate, legitimate, and non-malicious.
        </p>

        <h3 className="text-lg font-bold text-navy-900 mt-6 mb-2">2. Supported File Formats</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          The portal accepts PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, and CSV formats. Executable or script files are strictly rejected by security scanners.
        </p>
      </div>
    </div>
  );
};
