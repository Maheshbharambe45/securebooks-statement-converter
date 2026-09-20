import React from 'react';
import { Mail, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Column */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-xl mb-3">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>Secure Books</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Secure Document Submission Portal for Secure Books clients. Submit information and accounting documentation directly to our team.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-emerald-400 font-medium">
              <Mail className="w-4 h-4" />
              <a href="mailto:info@securebooks.co.uk" className="hover:underline">
                info@securebooks.co.uk
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 font-heading uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/forms')} className="hover:text-white transition">
                  Forms Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/forms/bookkeeping-documents')} className="hover:text-white transition">
                  Bookkeeping & VAT Documents
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/forms/vat-information')} className="hover:text-white transition">
                  VAT Information
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 font-heading uppercase tracking-wider">Legal & Info</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Secure Books. All rights reserved.</p>
          <p className="text-slate-400">
            <a href="https://www.securebooks.co.uk" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
              www.securebooks.co.uk
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
