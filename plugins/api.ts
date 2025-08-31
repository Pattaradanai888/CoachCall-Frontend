// plugins/api.ts
import type { FetchOptions, FetchRequest } from 'ofetch';
import { defineNuxtPlugin } from '#app';
import { ofetch } from 'ofetch';
import { isRef, unref, type Ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { debug } from '~/utils/logger';

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore();

  const baseFetcher = ofetch.create({
    baseURL: '/api', // This uses your SWA domain + /api (which proxies to backend)
    credentials: 'include', // This is crucial for cookies
    onRequest({ options, request }) {
      const headers = new Headers(options?.headers as HeadersInit | undefined);

      // token from store (same as before)
      const tokenSource = (authStore as unknown as { accessToken: string | null }).accessToken;
      const token = isRef(tokenSource) ? unref(tokenSource) : tokenSource;

      // --- Robust URL normalization (handles absolute/relative/baseURL cases) ---
      const rawReq = String(request ?? '');
      let url: URL;

      try {
        if (/^https?:\/\//i.test(rawReq)) {
          // absolute URL already
          url = new URL(rawReq);
        } else {
          // derive a usable base
          let base = (options && (options as any).baseURL) || '';

          // if base is empty or invalid, fall back to browser origin (client) or localhost (server)
          if (!base || typeof base !== 'string' || base.trim() === '') {
            base = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost';
          } else if (/^\//.test(base)) {
            // base is relative like "/api" -> prepend origin
            const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost';
            // remove trailing slash from base before joining
            base = origin + base.replace(/\/$/, '');
          }
          // finally build a full URL (works if rawReq is absolute path or relative)
          url = new URL(rawReq, base);
        }
      } catch (e) {
        // absolute fallback: ensure url exists and won't throw
        const fallbackOrigin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost';
        url = new URL('/' + rawReq.replace(/^\/+/, ''), fallbackOrigin);
      }

      // path AFTER the /api proxy prefix (works whether base was /api or full origin)
      const pathAfterApi = url.pathname.replace(/^\/api/, '') || '/';

      // debug: log the normalized path (useful to confirm matching logic)
      debug('[API-FETCH] normalized pathAfterApi:', pathAfterApi);

      const publicAuthPaths = ['/auth/token', '/auth/refresh', '/auth/register'];

      // Only add auth header when token exists and the request is NOT one of the public auth endpoints
      if (token && !publicAuthPaths.includes(pathAfterApi)) {
        headers.set('x-auth-token', `Bearer ${token}`);
        debug('[API-FETCH] x-auth-token header set for', pathAfterApi);
      } else {
        debug('[API-FETCH] x-auth-token header NOT set for', pathAfterApi, 'tokenPresent=', !!token);
      }

      // content-type handling (unchanged)
      if (!headers.has('Content-Type') && options?.body && !(options.body instanceof FormData)) {
        if (options.body instanceof URLSearchParams) {
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
          headers.set('Content-Type', 'application/json');
        }
      }

      options!.headers = headers;
    }
  });

  function is401(err: unknown): boolean {
    if (typeof err !== 'object' || err === null) return false;
    const e = err as Record<string, unknown>;
    const response = e['response'] as Record<string, unknown> | undefined;
    const status = response?.['status'] as number | undefined;
    return status === 401;
  }

  const apiFetch = async <T>(request: FetchRequest, options?: FetchOptions<'json'>): Promise<T> => {
    try {
      return await baseFetcher<T>(request, options);
    } catch (err: unknown) {
      // Only attempt token refresh on client-side and for 401 errors
      if (is401(err) &&
        !String(request).includes('/auth/refresh') &&
        !String(request).includes('/auth/token') &&
        import.meta.client) {

        console.log('API: 401 detected, attempting token refresh...');
        try {
          await authStore.refreshToken();
          console.log('API: Token refresh successful, retrying request');
          return await baseFetcher<T>(request, options);
        } catch (refreshError) {
          console.log('API: Token refresh failed, logging out');
          await authStore.logoutSilently();
          if (import.meta.client) {
            await navigateTo('/login');
          }
          throw refreshError;
        }
      }
      throw err;
    }
  };

  nuxtApp.provide('api', apiFetch);
});