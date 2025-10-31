// File: server/api/[...path].ts
import {
  appendResponseHeader,
  defineEventHandler,
  getHeaders,
  getMethod,
  getQuery,
  getRequestURL,
  readRawBody,
  setResponseHeader,
  setResponseStatus,
  getHeader,
  isMethod,
  readMultipartFormData
} from 'h3';
import { log, debug, logError } from '~/utils/logger';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const fullPath = url.pathname;
  const pathSegment = fullPath.replace(/^\/api\//, '');
  const method = getMethod(event);
  const query = getQuery(event);
  const headers = getHeaders(event);
  const contentType = getHeader(event, 'content-type') || '';

  let body: BodyInit | undefined = undefined;

  // Correctly handle multipart/form-data for file uploads
  if (isMethod(event, ['POST', 'PUT', 'PATCH']) && contentType.startsWith('multipart/form-data')) {
    try {
      const multipartData = await readMultipartFormData(event);
      if (multipartData) {
        const formData = new FormData();
        for (const part of multipartData) {
          if (part.name) {
            // Convert Buffer to Uint8Array to ensure compatibility with Blob constructor
            const uint8Array = new Uint8Array(part.data);
            const blob = new Blob([uint8Array], { type: part.type });
            formData.append(part.name, blob, part.filename);
          }
        }
        body = formData;
      }
    } catch (error) {
      logError('[SWA-PROXY] Error parsing multipart form data:', error);
      body = undefined;
    }
  } else if (isMethod(event, ['POST', 'PUT', 'PATCH'])) {
    // Keep original logic for other body types like application/json
    try {
      const rawBody = await readRawBody(event);
      if (rawBody) body = rawBody;
    } catch {
      body = undefined;
    }
  }

  const config = useRuntimeConfig();
  const backendUrl = config.backendUrl || 'https://coach-call-fastapi.southeastasia.cloudapp.azure.com';
  let targetUrl = `${backendUrl}/${pathSegment}`;

  if (Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    targetUrl += `?${params.toString()}`;
  }

  // Verbose logging toggle
  const VERBOSE = Boolean(process.env.PROXY_VERBOSE_LOGGING);

  // Helper: mask sensitive values (show first 6 chars then redacted)
  function maskValue(val?: string | null) {
    if (!val) return '';
    const s = String(val);
    if (s.length <= 10) return `${s.slice(0, 3)}<redacted>`;
    return `${s.slice(0, 6)}<redacted>`;
  }

  // Helper: mask cookie string values but keep attributes
  function maskCookieForLog(cookieStr: string) {
    // replace name=value with name=<redacted> but preserve attributes
    return cookieStr.replace(/([^=; \t]+)=([^;]+)/g, (_m, name) => {
      // mask only the value portion for the first cookie pair (name=...) and keep other attrs
      return `${name}=<redacted>`;
    });
  }

  // Helper: produce a compact header summary (presence + masked value for auth/cookie)
  function summarizeRequestHeaders(hdrs: Record<string, unknown>) {
    const summary: Record<string, string> = {};
    // Authorization
    const authKey = Object.keys(hdrs).find(k => k.toLowerCase() === 'authorization');
    if (authKey) {
      summary['authorization'] = maskValue(hdrs[authKey] as string).toString();
    } else {
      summary['authorization'] = '<missing>';
    }
    // Custom auth (x-auth-token)
    const customAuthKey = Object.keys(hdrs).find(k => k.toLowerCase() === 'x-auth-token');
    if (customAuthKey) {
      summary['x-auth-token'] = maskValue(hdrs[customAuthKey] as string).toString();
    } else {
      summary['x-auth-token'] = '<missing>';
    }
    // Cookie (only presence)
    const cookieKey = Object.keys(hdrs).find(k => k.toLowerCase() === 'cookie');
    if (cookieKey) {
      // do not log raw cookie values; indicate which cookie names are present
      try {
        const cookieNames = String(hdrs[cookieKey])
          .split(';')
          .map(s => s.split('=')[0].trim())
          .filter(Boolean)
          .join(', ');
        summary['cookies'] = cookieNames || '<present>';
      } catch {
        summary['cookies'] = '<present>';
      }
    } else {
      summary['cookies'] = '<none>';
    }

    // Also include common fetch meta
    summary['user-agent'] = hdrs['user-agent'] ? '<present>' : '<missing>';
    return summary;
  }

  // Print request debug info (masked)
  if (VERBOSE) {
    log(`[SWA-PROXY] PROXY REQUEST -> Method: ${method} Target: ${targetUrl}`);
    log(`[SWA-PROXY] Incoming headers summary:`, summarizeRequestHeaders(headers));
  } else {
    log(`[SWA-PROXY] ${method} ${targetUrl}`);
  }

  try {
    // Build forward headers robustly (case-insensitive, exclude host)
    const forwardHeaders = new Headers();

    // copy all incoming headers except host
    for (const [k, v] of Object.entries(headers)) {
      if (!k) continue;
      const lk = k.toLowerCase();
      // Let ofetch set the Content-Type header for multipart data
      if (lk === 'host' || (contentType.startsWith('multipart/form-data') && (lk === 'content-type' || lk === 'content-length'))) {
        continue;
      }
      // Some header values may be arrays or objects, normalize to string
      if (typeof v === 'string') {
        forwardHeaders.set(k, v);
      } else if (Array.isArray(v)) {
        forwardHeaders.set(k, (v as string[]).join(', '));
      } else if (v !== undefined && v !== null) {
        forwardHeaders.set(k, String(v));
      }
    }

    // Map x-auth-token back to Authorization (overrides any SWA-injected value)
    if (forwardHeaders.has('x-auth-token')) {
      forwardHeaders.set('Authorization', forwardHeaders.get('x-auth-token')!);
      // Optional: Remove x-auth-token if not needed by backend
      // forwardHeaders.delete('x-auth-token');
      debug('[SWA-PROXY] Mapped x-auth-token to Authorization for forwarding');
    }

    if (VERBOSE) {
      // list which headers we'll forward and whether they contain auth/cookie
      const forwardedList: Record<string, string> = {};
      forwardHeaders.forEach((v, k) => {
        if (k.toLowerCase() === 'authorization') forwardedList[k] = maskValue(v);
        else if (k.toLowerCase() === 'x-auth-token') forwardedList[k] = maskValue(v);
        else if (k.toLowerCase() === 'cookie') forwardedList[k] = '<cookie(s) forwarded>';
        else forwardedList[k] = '<forwarded>';
      });
      log('[SWA-PROXY] Forwarding headers:', forwardedList);
    } else {
      // minimal logging
      const hasAuth = forwardHeaders.has('authorization') || forwardHeaders.has('Authorization');
      const hasCustomAuth = forwardHeaders.has('x-auth-token');
      log(`[SWA-PROXY] Forwarding cookies: ${headers['cookie'] ? '<present>' : 'none'}, hasAuthorization: ${hasAuth}, hasCustomAuth: ${hasCustomAuth}`);
    }

    const response = await $fetch.raw(targetUrl, {
      method,
      body,
      headers: forwardHeaders,
      // ensure credentials aren't automatically stripped by underlying fetch
      // (ofetch/raw fetch in Nitro should forward headers as-is)
    });

    // Response status & size
    const respStatus = response.status || 200;
    const contentLength = response.headers.get('content-length') || '<unknown>';

    // Handle Set-Cookie headers properly
    // response.headers.getSetCookie?.() is available in ofetch raw response in your previous code
    const setCookieHeaders = (response.headers.getSetCookie && response.headers.getSetCookie()) || [];
    if (VERBOSE) {
      log(`[SWA-PROXY] Backend responded status=${respStatus} content-length=${contentLength} set-cookie-count=${setCookieHeaders.length}`);
    } else {
      log(`[SWA-PROXY] Backend set ${setCookieHeaders.length} cookies`);
    }

    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookieString, index) => {
        // Mask cookie value for logs
        const maskedForLog = maskCookieForLog(cookieString);
        if (VERBOSE) {
          log(`[SWA-PROXY] Original cookie ${index}: ${maskedForLog}`);
        } else {
          // show only cookie names in non-verbose mode
          const names = String(cookieString).split(';').map(s => s.split('=')[0].trim()).filter(Boolean).join(', ');
          log(`[SWA-PROXY] Original cookie ${index}: ${names}`);
        }

        // Modify cookie for security: remove Domain, ensure SameSite & Secure & HttpOnly for refresh
        let modifiedCookie = cookieString;
        modifiedCookie = modifiedCookie.replace(/;\s*domain=[^;]+/gi, '');

        // Ensure HttpOnly for refresh_token cookies
        if (/^\s*refresh_token=/i.test(modifiedCookie.trim())) {
          if (!/httponly/i.test(modifiedCookie)) modifiedCookie += '; HttpOnly';
        }

        if (!/samesite=/i.test(modifiedCookie)) modifiedCookie += '; SameSite=Lax';
        else modifiedCookie = modifiedCookie.replace(/samesite=none/gi, 'SameSite=Lax');

        if (!/secure/i.test(modifiedCookie)) modifiedCookie += '; Secure';

        // Append masked log of modified cookie (no raw values)
        if (VERBOSE) {
          log(`[SWA-PROXY] Modified cookie ${index}: ${maskCookieForLog(modifiedCookie)}`);
        } else {
          const names = String(modifiedCookie).split(';').map(s => s.split('=')[0].trim()).filter(Boolean).join(', ');
          log(`[SWA-PROXY] Modified cookie ${index}: ${names}`);
        }

        appendResponseHeader(event, 'Set-Cookie', modifiedCookie);
      });
    }

    // *** FIX: Force clear the refresh_token cookie on successful logout ***
    if (pathSegment === 'auth/logout' && respStatus >= 200 && respStatus < 300) {
      log('[SWA-PROXY] Detected successful logout. Forcing refresh_token cookie clearance.');
      // Setting Max-Age=0 tells the browser to expire the cookie immediately.
      // Not setting a domain is more robust for clearing cookies.
      const clearingCookie = 'refresh_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
      appendResponseHeader(event, 'Set-Cookie', clearingCookie);
    }

    // Forward back useful non-sensitive headers
    const headersToForwardBack = ['content-type', 'cache-control', 'expires', 'last-modified', 'etag'];
    headersToForwardBack.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) setResponseHeader(event, headerName, headerValue);
    });

    // CORS headers for same-origin; reflect origin
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');
    const frontendOrigin = getHeaders(event)['origin'] || url.origin;
    setResponseHeader(event, 'Access-Control-Allow-Origin', frontendOrigin);
    // Ensure caches vary by origin
    setResponseHeader(event, 'Vary', 'Origin');

    if (VERBOSE) {
      log(`[SWA-PROXY] Returning proxied response status=${respStatus}`);
    }
    setResponseStatus(event, respStatus);
    return response._data;
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : String(error);
    logError(`[SWA-PROXY] Error proxying ${method} ${targetUrl}:`, errorMessage);

    // Check if error has response property (ofetch error structure)
    if (error && typeof error === 'object' && 'response' in error) {
      const fetchError = error as { response: { status?: number; _data?: unknown } };
      const status = fetchError.response.status || 500;
      setResponseStatus(event, status);
      // Mask any proxied error body to avoid sensitive token echoes
      const data = fetchError.response._data;
      if (VERBOSE) {
        logError('[SWA-PROXY] Backend error body (masked):', typeof data === 'string' ? '<string body>' : '<json body>');
      }
      return data || { error: 'Backend request failed' };
    } else {
      setResponseStatus(event, 500);
      return { error: 'Internal server error' };
    }
  }
});