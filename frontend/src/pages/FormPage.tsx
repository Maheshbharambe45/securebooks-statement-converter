import React, { useState } from 'react';
import { FormDefinition, CategoryState, CategoryStatus, SubmissionResponse } from '../types';
import { getFormDefinition, BOOKKEEPING_FORM } from '../forms/formRegistry';
import { CategoryCard } from '../components/CategoryCard';
import { ReviewModal } from '../components/ReviewModal';
import { ProgressModal } from '../components/ProgressModal';
import { SuccessPage } from '../components/SuccessPage';
import { submitFormDocuments } from '../services/api';
import {
  User,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface FormPageProps {
  formId: string;
  onNavigate: (path: string) => void;
}

export const FormPage: React.FC<FormPageProps> = ({ formId, onNavigate }) => {
  const formConfig: FormDefinition = getFormDefinition(formId) || BOOKKEEPING_FORM;

  // Form Field States
  const [clientName, setClientName] = useState<string>('');

  // Validation Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories state
  const [categoriesState, setCategoriesState] = useState<Record<string, CategoryState>>(() => {
    const initialState: Record<string, CategoryState> = {};
    formConfig.categories.forEach((cat) => {
      initialState[cat.id] = {
        status: 'has_documents',
        notes: '',
        files: [],
      };
    });
    return initialState;
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  // Workflow Modal States
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);

  const handleCategoryStatusChange = (categoryId: string, status: CategoryStatus) => {
    setCategoriesState((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        status,
      },
    }));
  };

  const handleClearCategoryFiles = (categoryId: string) => {
    setCategoriesState((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        files: [],
      },
    }));
  };

  const handleCategoryNotesChange = (categoryId: string, notes: string) => {
    setCategoriesState((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        notes,
      },
    }));
  };

  const handleFilesAdded = (categoryId: string, newFiles: File[]) => {
    setCategoriesState((prev) => {
      const currentFiles = prev[categoryId]?.files || [];
      const existingNames = new Set(currentFiles.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name));

      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          files: [...currentFiles, ...filtered],
        },
      };
    });
  };

  const handleRemoveFile = (categoryId: string, fileIndex: number) => {
    setCategoriesState((prev) => {
      const currentFiles = [...(prev[categoryId]?.files || [])];
      currentFiles.splice(fileIndex, 1);
      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          files: currentFiles,
        },
      };
    });
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!clientName.trim()) {
      errs.clientName = 'Client Name is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenReview = () => {
    setGeneralError(null);
    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }
    setIsReviewOpen(true);
  };

  const handleConfirmSubmission = async () => {
    setIsReviewOpen(false);
    setIsSubmitting(true);
    setUploadPercent(10);
    setGeneralError(null);

    const interval = setInterval(() => {
      setUploadPercent((prev) => (prev < 90 ? prev + 15 : prev));
    }, 300);

    const fieldValuesPayload = {
      clientName: clientName.trim(),
      bookkeepingPeriod: 'N/A',
      selectionType: 'N/A',
      selectedPeriod: 'N/A',
      startDate: '',
      endDate: '',
      clientEmail: '',
    };

    // Extract notes from other_documents category if present
    const otherNotes = categoriesState['other_documents']?.notes || categoriesState['additional_docs']?.notes || '';

    try {
      const res = await submitFormDocuments(
        formConfig.id,
        fieldValuesPayload,
        categoriesState,
        otherNotes,
        (percent) => {
          setUploadPercent(Math.max(percent, 20));
        }
      );

      clearInterval(interval);
      setUploadPercent(100);

      setTimeout(() => {
        setIsSubmitting(false);
        if (res.success) {
          setSubmissionResult(res);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setGeneralError(res.error || "We couldn't submit your documents right now. Please try again.");
          if (res.details && res.details.length > 0) {
            setGeneralError(`${res.error || 'Validation error'}: ${res.details.join(', ')}`);
          }
        }
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsSubmitting(false);
      setGeneralError(err.message || "We couldn't submit your documents right now. Please try again.");
    }
  };

  const handleReset = () => {
    setClientName('');

    const initialCats: Record<string, CategoryState> = {};
    formConfig.categories.forEach((cat) => {
      initialCats[cat.id] = { status: 'has_documents', notes: '', files: [] };
    });
    setCategoriesState(initialCats);
    setSubmissionResult(null);
    setGeneralError(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalFilesSelected = Object.values(categoriesState).reduce(
    (sum, cat) => (cat.status === 'has_documents' ? sum + cat.files.length : sum),
    0
  );

  if (submissionResult) {
    return (
      <SuccessPage
        response={submissionResult}
        clientName={clientName}
        bookkeepingPeriod="Submitted Documents"
        onReset={handleReset}
        onNavigateForms={() => onNavigate('/forms')}
      />
    );
  }

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Form Title Banner */}
      <div className="bg-navy-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-navy-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
            Secure Books
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            {formConfig.title}
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            {formConfig.description}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Progress Indicator */}
        <div className="mb-8 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
            <span className={`flex items-center space-x-1 ${clientName ? 'text-emerald-800 font-bold' : ''}`}>
              <span>Client Name</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <span className={`flex items-center space-x-1 ${totalFilesSelected > 0 ? 'text-emerald-800 font-bold' : ''}`}>
              <span>Documents</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span>Review</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <span className="text-slate-400">Submit</span>
          </div>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs sm:text-sm text-red-800 flex items-start space-x-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-900 font-semibold">Submission Error</strong>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        {/* Client Details Section */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold font-heading text-navy-900">Client Details</h2>
            <p className="text-xs text-slate-500">Provide your client or business name for this submission.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
              <span>Client Name <span className="text-red-500">*</span></span>
              <span className="text-xs font-normal text-slate-400">Required</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. ABC Ltd or John Smith"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (errors.clientName) setErrors((prev) => ({ ...prev, clientName: '' }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.clientName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-navy-600 focus:ring-navy-100'
                }`}
              />
            </div>
            {errors.clientName && (
              <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errors.clientName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Document Categories List */}
        <div className="space-y-6">
          {formConfig.categories.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              category={{
                id: cat.id,
                number: idx + 1,
                title: cat.title,
                uploadLabel: cat.uploadLabel,
                description: cat.description,
                notesLabel: cat.notesLabel || 'Notes for Bookkeeper',
                supportedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP'],
                allowsMultiple: true,
                allowsNA: true,
              }}
              state={categoriesState[cat.id] || { status: 'has_documents', notes: '', files: [] }}
              onStatusChange={(status) => handleCategoryStatusChange(cat.id, status)}
              onClearFiles={() => handleClearCategoryFiles(cat.id)}
              onNotesChange={(notes) => handleCategoryNotesChange(cat.id, notes)}
              onFilesAdded={(files) => handleFilesAdded(cat.id, files)}
              onRemoveFile={(index) => handleRemoveFile(cat.id, index)}
            />
          ))}
        </div>

        {/* Submission Section */}
        <div className="mt-10 bg-white border border-slate-200 shadow-elevated rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/95">
          <div>
            <h4 className="text-sm font-bold text-navy-900 font-heading">Submission</h4>
            <p className="text-xs text-slate-500">
              Please review your documents and notes, then submit your completed form to Secure Books.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenReview}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>Submit Form</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirmSubmit={handleConfirmSubmission}
        clientInfo={{
          clientName: clientName || '',
          bookkeepingPeriod: 'N/A',
          monthQuarter: 'N/A',
          clientEmail: '',
        }}
        categories={categoriesState}
        additionalNotes={categoriesState['other_documents']?.notes || ''}
      />

      {/* Live Progress Modal */}
      <ProgressModal isOpen={isSubmitting} uploadPercent={uploadPercent} />
    </div>
  );
};
