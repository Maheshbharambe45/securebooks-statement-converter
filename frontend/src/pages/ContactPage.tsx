import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-4 sm:p-12 w-full max-w-full">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900 mb-4">
          Contact Secure Books
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mb-8 leading-relaxed">
          Need help with your bookkeeping or document submission? Contact our team directly using the details below.
        </p>

        <div className="space-y-6 w-full max-w-full">
          <div className="flex items-start space-x-3 sm:space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-0 w-full max-w-full">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 w-full max-w-full">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Primary Email</h3>
              <a
                href="mailto:info@securebooks.co.uk"
                className="text-base sm:text-lg font-bold text-navy-900 hover:text-emerald-700 transition block max-w-full [overflow-wrap:anywhere] break-words break-all"
              >
                info@securebooks.co.uk
              </a>
              <p className="text-xs text-slate-500 mt-1">Mon - Fri: 9:00 AM - 5:00 PM GMT</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 sm:space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200 min-w-0 w-full max-w-full">
            <div className="p-3 bg-navy-100 text-navy-900 rounded-lg shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1 w-full max-w-full">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">Website</h3>
              <a
                href="https://www.securebooks.co.uk"
                target="_blank"
                rel="noreferrer"
                className="text-base sm:text-lg font-bold text-navy-900 hover:text-emerald-700 transition block max-w-full [overflow-wrap:anywhere] break-words break-all"
              >
                https://www.securebooks.co.uk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
