import React from 'react';
import { User, Calendar, Clock, Mail, AlertCircle } from 'lucide-react';
import { ClientInfo } from '../types';

interface ClientInfoStepProps {
  clientInfo: ClientInfo;
  onChange: (field: keyof ClientInfo, value: string) => void;
  errors: Record<string, string>;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({ clientInfo, onChange, errors }) => {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-800 font-bold text-lg">
          1
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-navy-900">Client Information</h2>
          <p className="text-xs text-slate-500">Please specify your client name and the accounting period for this submission.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Client Name <span className="text-red-500">*</span></span>
            <span className="text-xs font-normal text-slate-400">Required</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. ABC Limited or John Smith"
              value={clientInfo.clientName}
              onChange={(e) => onChange('clientName', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.clientName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
              }`}
            />
          </div>
          {errors.clientName && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.clientName}</span>
            </p>
          )}
        </div>

        {/* Bookkeeping Period */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Bookkeeping Period <span className="text-red-500">*</span></span>
            <span className="text-xs font-normal text-slate-400">Required</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. 01/08/2026 - 31/08/2026"
              value={clientInfo.bookkeepingPeriod}
              onChange={(e) => onChange('bookkeepingPeriod', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.bookkeepingPeriod ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
              }`}
            />
          </div>
          {errors.bookkeepingPeriod && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.bookkeepingPeriod}</span>
            </p>
          )}
        </div>

        {/* Month / Quarter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Month / Quarter <span className="text-red-500">*</span></span>
            <span className="text-xs font-normal text-slate-400">Required</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. August 2026 or Q3 2026"
              value={clientInfo.monthQuarter}
              onChange={(e) => onChange('monthQuarter', e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.monthQuarter ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
              }`}
            />
          </div>
          {errors.monthQuarter && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.monthQuarter}</span>
            </p>
          )}
        </div>

        {/* Client Email (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Client Email</span>
            <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="e.g. accounts@abclimited.co.uk"
              value={clientInfo.clientEmail}
              onChange={(e) => onChange('clientEmail', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:border-navy-600 focus:ring-navy-100 transition"
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">If provided, used only for sending your submission reference receipt.</p>
        </div>
      </div>
    </div>
  );
};
