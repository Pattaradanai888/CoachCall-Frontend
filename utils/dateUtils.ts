// utils/dateUtils.ts
export function formatDateSafely(
  dateString: string | null | undefined,
  locale: string = 'en-US',
): string | null {
  if (!dateString)
    return null;

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime()))
      return null;

    // Use consistent formatting that works on both server and client
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Important: Use UTC to avoid timezone differences
    });
  }
  catch (e) {
    console.error('Error formatting date:', e);
    return null;
  }
}

export function formatDateWithFallback(
  dateString: string | null | undefined,
  fallback: string = 'Not specified',
): string {
  const formatted = formatDateSafely(dateString);
  return formatted || fallback;
}

export function useClientSafeDate() {
  const isClient = import.meta.client;

  const formatDate = (dateString: string | null | undefined, locale: string = 'en-US') => {
    if (!isClient) {
      // On server, return a simple format
      if (!dateString)
        return null;
      try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime()))
          return null;
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      catch {
        return null;
      }
    }

    // On client, use the full formatting
    return formatDateSafely(dateString, locale);
  };

  return { formatDate, isClient };
}
