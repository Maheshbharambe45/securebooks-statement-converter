import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface MonthQuarterSelectorProps {
  type: 'month' | 'quarter';
  selectedMonth: string;
  selectedYear: string;
  selectedQuarter: string;
  onChange: (type: 'month' | 'quarter', month: string, year: string, quarter: string) => void;
  error?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2024', '2025', '2026', '2027', '2028'];

export const MonthQuarterSelector: React.FC<MonthQuarterSelectorProps> = ({
  type,
  selectedMonth,
  selectedYear,
  selectedQuarter,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      {/* Type Selector: Radio Toggle */}
      <div className="flex items-center space-x-6 bg-slate-100/80 p-2 rounded-xl border border-slate-200">
        <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-xs text-slate-700">
          <input
            type="radio"
            name="period_type"
            checked={type === 'month'}
            onChange={() => onChange('month', selectedMonth || 'April', selectedYear || '2026', selectedQuarter)}
            className="accent-emerald-700 w-4 h-4"
          />
          <span>Month</span>
        </label>

        <label className="inline-flex items-center space-x-2 cursor-pointer font-semibold text-xs text-slate-700">
          <input
            type="radio"
            name="period_type"
            checked={type === 'quarter'}
            onChange={() => onChange('quarter', selectedMonth, selectedYear || '2026', selectedQuarter || 'Q1')}
            className="accent-emerald-700 w-4 h-4"
          />
          <span>Quarter</span>
        </label>
      </div>

      {/* Month Selection View */}
      {type === 'month' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => onChange('month', e.target.value, selectedYear, selectedQuarter)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onChange('month', selectedMonth, e.target.value, selectedQuarter)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quarter Selection View */}
      {type === 'quarter' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => onChange('quarter', selectedMonth, e.target.value, selectedQuarter)}
              className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-100"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Quarter</label>
            <div className="grid grid-cols-4 gap-2">
              {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                <label
                  key={q}
                  className={`border rounded-lg p-2 text-center text-xs font-bold cursor-pointer transition ${
                    selectedQuarter === q
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="quarter_choice"
                    checked={selectedQuarter === q}
                    onChange={() => onChange('quarter', selectedMonth, selectedYear, q)}
                    className="sr-only"
                  />
                  <span>{q}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center space-x-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
