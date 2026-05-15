import { findStreamRule, getRelativeStreamPath } from './config.js';

const FAILOVER_STATUS_CODES = new Set([403, 404, 429, 500, 502, 503, 504]);

export async function handleStreamRequest(request, streams, fetchImpl = fetch) {
  const requestUrl = new URL(request.url);
  const stream = findStreamRule(streams, requestUrl.pathname);

  if (!stream) {
    return null;
  }

  const relativePath = getRelativeStreamPath(stream, requestUrl.pathname);
  const attempts = buildAttempts(stream);

  for (const attempt of attempts) {
    const targetUrl = buildTargetUrl(attempt.baseUrl, relativePath, requestUrl.search);
    const result = await tryFetchRoute(request, targetUrl, stream.timeoutMs, fetchImpl);

    if (result.response && !shouldFailover(result.response.status)) {
      const headers = new Headers(result.response.headers);
      headers.set('x-streampass-route', attempt.name);
      headers.set('x-streampass-target', targetUrl.toString());

      return new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers
      });
    }
  }

  return new Response('StreamPass could not reach any configured route.\n', {
    status: 502,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-streampass-error': 'all-routes-failed'
    }
  });
}

export function buildAttempts(stream) {
  const attempts = [...stream.routes];

  if (stream.allowOriginFallback && stream.origin) {
    attempts.push({
      name: 'origin',
      baseUrl: stream.origin.baseUrl
    });
  }

  return attempts;
}

export function buildTargetUrl(baseUrl, relativePath, search) {
  const cleanRelativePath = relativePath ? relativePath.replace(/^\/+/, '') : '';
  const separator = cleanRelativePath ? '/' : '';

  return new URL(`${baseUrl}${separator}${cleanRelativePath}${search || ''}`);
}

export function shouldFailover(statusCode) {
  return FAILOVER_STATUS_CODES.has(statusCode);
}

async function tryFetchRoute(originalRequest, targetUrl, timeoutMs, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(targetUrl, {
      method: originalRequest.method,
      headers: copyRequestHeaders(originalRequest.headers),
      signal: controller.signal
    });

    return { response, error: null };
  } catch (error) {
    return { response: null, error };
  } finally {
    clearTimeout(timeout);
  }
}

function copyRequestHeaders(headers) {
  const copied = new Headers(headers);
  copied.delete('host');
  copied.delete('connection');
  copied.delete('content-length');
  return copied;
}
