import React from 'react';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  errors: { startDate?: string; endDate?: string; dateRange?: string };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  errors,
}) => {
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChange(e.target.value, endDate)}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.startDate || errors.dateRange ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
              }`}
            />
          </div>
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.startDate}</span>
            </p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            End Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChange(startDate, e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.endDate || errors.dateRange ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
              }`}
            />
          </div>
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.endDate}</span>
            </p>
          )}
        </div>
      </div>

      {errors.dateRange && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errors.dateRange}</span>
        </p>
      )}

      {/* Selected Period Display */}
      {startDate && endDate && !errors.dateRange && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 font-semibold flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Bookkeeping Period: {formatDateDisplay(startDate)} → {formatDateDisplay(endDate)}
          </span>
        </div>
      )}
    </div>
  );
};
