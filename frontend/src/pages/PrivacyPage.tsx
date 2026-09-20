import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-12 prose prose-slate w-full max-w-full">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
          <Shield className="w-8 h-8 text-emerald-700 shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 m-0">
            Privacy Policy
          </h1>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          At Secure Books, we take the confidentiality and protection of your business information and accounting documentation seriously. This privacy policy outlines how document submissions sent via <a href="https://www.securebooks.co.uk" className="text-emerald-700 hover:underline [overflow-wrap:anywhere] break-words">www.securebooks.co.uk</a> are handled.
        </p>

        <h3 className="text-lg font-bold text-navy-900 mt-6 mb-2">1. Information Collection</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          We collect information and documents submitted directly by you through our submission portal forms (e.g. Client Name, Bookkeeping Period, Month/Quarter, and uploaded statements, invoices, and accounting files).
        </p>

        <h3 className="text-lg font-bold text-navy-900 mt-6 mb-2">2. Processing & Storage</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Uploaded files are processed securely to generate email notifications delivered directly to our designated Secure Books mailbox. Files exist temporarily during active submission transmission and are removed automatically following delivery.
        </p>

        <h3 className="text-lg font-bold text-navy-900 mt-6 mb-2">3. Contacting Us</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          If you have questions regarding data privacy, please contact <a href="mailto:info@securebooks.co.uk" className="text-emerald-700 hover:underline [overflow-wrap:anywhere] break-words">info@securebooks.co.uk</a>.
        </p>
      </div>
    </div>
  );
};
