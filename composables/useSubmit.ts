// composables/useSubmit.ts
import { ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSubmit<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: string) => void;
  },
) {
  const loading = ref(false);
  const submissionError = ref<string | null>(null);

  const submit = async (...args: Parameters<T>) => {
    loading.value = true;
    submissionError.value = null;
    try {
      const result = await action(...args);
      options?.onSuccess?.(result);
      return result;
    }
    catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (err && typeof err === 'object') {
        if ('response' in err) {
          const response = (err as { response?: { _data?: { detail?: string } } }).response;
          errorMessage = response?._data?.detail || errorMessage;
        } else if ('message' in err) {
          errorMessage = (err as { message: string }).message;
        }
      }
      submissionError.value = errorMessage;
      options?.onError?.(errorMessage);
    }
    finally {
      loading.value = false;
    }
  };

  return { loading, submissionError, submit };
}
