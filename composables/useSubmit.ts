// composables/useSubmit.ts
import { ref } from 'vue';

export function useSubmit<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: any) => void;
  },
) {
  const loading = ref(false);
  // Renamed to avoid conflicts with vee-validate's 'errors'
  const submissionError = ref<string | null>(null);

  const submit = async (...args: Parameters<T>) => {
    loading.value = true;
    submissionError.value = null;
    try {
      const result = await action(...args);
      options?.onSuccess?.(result);
      return result;
    }
    catch (err: any) {
      const errorMessage = err.response?._data?.detail || err.message || 'An unexpected error occurred.';
      submissionError.value = errorMessage;
      options?.onError?.(errorMessage);
    }
    finally {
      loading.value = false;
    }
  };

  return { loading, submissionError, submit };
}
