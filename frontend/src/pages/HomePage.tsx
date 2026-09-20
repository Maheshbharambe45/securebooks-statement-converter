import React from 'react';
import { FileText, ArrowRight, Mail, CheckCircle2, Shield, FileCheck } from 'lucide-react';
import { BOOKKEEPING_FORM } from '../forms/formRegistry';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Secure Books Client Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
            Secure Books
          </h1>

          <p className="mt-4 text-lg sm:text-2xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed">
            A Simpler Way to Work With Secure Books
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('/forms')}
              className="inline-flex items-center justify-center space-x-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5" />
              <span>Choose a Form</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-navy-900">
            How It Works
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Submit your documents and information in five simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Choose a Form', desc: 'Select the service form matching your requirements.' },
            { step: '2', title: 'Complete Details', desc: 'Provide your client name and period details.' },
            { step: '3', title: 'Attach Documents', desc: 'Upload statements, invoices, and receipts or select N/A.' },
            { step: '4', title: 'Review', desc: 'Verify all details before final submission.' },
            { step: '5', title: 'Submit', desc: 'Send your completed submission directly to Secure Books.' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-xs flex flex-col items-center justify-between"
            >
              <div className="w-9 h-9 rounded-full bg-navy-50 text-navy-900 font-bold text-sm flex items-center justify-center mb-3 border border-navy-100">
                {item.step}
              </div>
              <h3 className="text-sm font-bold font-heading text-navy-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Service Form */}
      <section className="bg-slate-100/80 border-y border-slate-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-card p-5 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 inline-block">
              Active Form
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-navy-900">
              Bookkeeping & VAT Documents
            </h3>
            <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
              Submit the documents and information required for your bookkeeping period.
            </p>
          </div>

          <button
            onClick={() => onNavigate(`/forms/${BOOKKEEPING_FORM.id}`)}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
          >
            <span>Start Form</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold font-heading text-navy-900 mb-2">Contact Secure Books</h3>
          <p className="text-slate-600 text-sm mb-4">
            If you have questions about submitting your documents, please reach out to our team.
          </p>
          <a
            href="mailto:info@securebooks.co.uk"
            className="inline-flex items-center space-x-2 text-emerald-800 font-semibold text-base hover:underline"
          >
            <Mail className="w-5 h-5" />
            <span>info@securebooks.co.uk</span>
          </a>
        </div>
      </section>
    </div>
  );
};
