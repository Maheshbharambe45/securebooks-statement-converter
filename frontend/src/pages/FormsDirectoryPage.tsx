import React from 'react';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { ALL_FORMS_LIST } from '../forms/formRegistry';

interface FormsDirectoryPageProps {
  onNavigate: (path: string) => void;
}

export const FormsDirectoryPage: React.FC<FormsDirectoryPageProps> = ({ onNavigate }) => {
  const availableForms = ALL_FORMS_LIST.filter((f) => f.status === 'ACTIVE');
  const upcomingForms = ALL_FORMS_LIST.filter((f) => f.status === 'COMING_SOON');

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-navy-900">
            Choose a Form
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Select the service you need
          </p>
        </div>

        {/* Section 1: Available Forms */}
        <div className="mb-14">
          <h2 className="text-xl font-bold font-heading text-navy-900 mb-6 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Available Forms</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-elevated transition p-5 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
                      <FileText className="w-7 h-7" />
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                      {form.badgeText || 'Available'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-navy-900 mb-2">{form.name}</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">{form.description}</p>
                </div>

                <button
                  onClick={() => onNavigate(`/forms/${form.id}`)}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
                >
                  <span>Start Form</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Future & Upcoming Forms */}
        <div>
          <h2 className="text-xl font-bold font-heading text-navy-900 mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>Future & Upcoming Forms</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingForms.map((form) => (
              <div
                key={form.id}
                className="bg-white/80 rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold font-heading text-slate-800">{form.name}</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{form.description}</p>
                </div>

                <button
                  disabled
                  className="w-full inline-flex items-center justify-center bg-slate-100 text-slate-400 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed border border-slate-200"
                >
                  <span>Coming Soon</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
