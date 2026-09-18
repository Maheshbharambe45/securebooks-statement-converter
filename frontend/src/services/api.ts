import axios from 'axios';
import { CategoryState, SubmissionResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function submitFormDocuments(
  formId: string,
  fieldValues: Record<string, string>,
  categories: Record<string, CategoryState>,
  additionalNotes: string,
  onUploadProgress?: (percent: number) => void
): Promise<SubmissionResponse> {
  const formData = new FormData();

  // 1. Dynamic Client Form Fields
  for (const [key, value] of Object.entries(fieldValues)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }

  if (additionalNotes) {
    formData.append('additionalNotes', additionalNotes);
  }

  // 2. Category Statuses, Notes & Files
  const categoryStatuses: Record<string, { status: 'has_documents' | 'na'; notes?: string }> = {};

  for (const [catKey, catState] of Object.entries(categories)) {
    categoryStatuses[catKey] = {
      status: catState.status,
      notes: catState.notes,
    };

    // Append files if status is 'has_documents'
    if (catState.status === 'has_documents' && catState.files.length > 0) {
      for (const file of catState.files) {
        formData.append(`files_${catKey}`, file, file.name);
      }
    }
  }

  formData.append('categoryStatuses', JSON.stringify(categoryStatuses));

  try {
    const endpoint = `${API_BASE_URL}/forms/${encodeURIComponent(formId)}/submissions`;
    const response = await axios.post<SubmissionResponse>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });

    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      return err.response.data as SubmissionResponse;
    }
    return {
      success: false,
      error: err.message || 'Network error occurred while connecting to Secure Books server.',
    };
  }
}

// Backward compatibility alias wrapper
export async function submitDocuments(
  clientInfo: Record<string, string>,
  categories: Record<string, CategoryState>,
  additionalNotes: string,
  onUploadProgress?: (percent: number) => void
): Promise<SubmissionResponse> {
  return submitFormDocuments('bookkeeping-documents', clientInfo, categories, additionalNotes, onUploadProgress);
}
