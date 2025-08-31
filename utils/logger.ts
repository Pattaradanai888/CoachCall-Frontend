// Lightweight logger utility to avoid stray console.* in production
// Usage: import { log, debug, warn, error } from '~/utils/logger'
// All output suppressed in production unless explicitly enabled via env.

const isDev = import.meta.dev;
const showLogs = isDev || import.meta.env.VITE_SHOW_LOGS === 'true';
const showErrors = isDev || import.meta.env.VITE_SHOW_ERRORS === 'true' || showLogs;

export function log(...args: any[]) { if (showLogs) console.log(...args); }
export function debug(...args: any[]) { if (showLogs) console.debug(...args); }
export function warn(...args: any[]) { if (showLogs) console.warn(...args); }
export function error(...args: any[]) { if (showErrors) console.error(...args); }
