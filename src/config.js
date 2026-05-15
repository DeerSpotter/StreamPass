import { readFile } from 'node:fs/promises';

export async function loadStreamConfig(configPath = new URL('../config/streams.json', import.meta.url)) {
  const raw = await readFile(configPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || !Array.isArray(parsed.streams)) {
    throw new Error('Stream config must contain a streams array.');
  }

  return parsed.streams.map(validateStreamRule);
}

export function validateStreamRule(rule) {
  if (!rule || typeof rule !== 'object') {
    throw new Error('Stream rule must be an object.');
  }

  if (!rule.name || typeof rule.name !== 'string') {
    throw new Error('Stream rule requires a string name.');
  }

  if (!rule.publicPath || typeof rule.publicPath !== 'string' || !rule.publicPath.startsWith('/')) {
    throw new Error(`Stream rule ${rule.name} requires a publicPath starting with /.`);
  }

  if (!Number.isInteger(rule.timeoutMs) || rule.timeoutMs < 1) {
    throw new Error(`Stream rule ${rule.name} requires a positive integer timeoutMs.`);
  }

  if (!Array.isArray(rule.routes)) {
    throw new Error(`Stream rule ${rule.name} requires a routes array.`);
  }

  for (const route of rule.routes) {
    if (!route.name || typeof route.name !== 'string') {
      throw new Error(`Stream rule ${rule.name} has a route without a name.`);
    }

    if (!route.baseUrl || typeof route.baseUrl !== 'string') {
      throw new Error(`Stream rule ${rule.name} route ${route.name} requires a baseUrl.`);
    }
  }

  if (rule.allowOriginFallback === true) {
    if (!rule.origin || typeof rule.origin.baseUrl !== 'string') {
      throw new Error(`Stream rule ${rule.name} allows origin fallback but has no origin.baseUrl.`);
    }
  }

  return {
    ...rule,
    publicPath: normalizePath(rule.publicPath),
    allowOriginFallback: rule.allowOriginFallback === true,
    routes: rule.routes.map((route) => ({
      ...route,
      baseUrl: stripTrailingSlash(route.baseUrl)
    })),
    origin: rule.origin && rule.origin.baseUrl
      ? { ...rule.origin, baseUrl: stripTrailingSlash(rule.origin.baseUrl) }
      : null
  };
}

export function findStreamRule(streams, requestPath) {
  const normalizedRequestPath = normalizePath(requestPath);

  return streams.find((stream) => {
    return normalizedRequestPath === stream.publicPath || normalizedRequestPath.startsWith(`${stream.publicPath}/`);
  }) || null;
}

export function getRelativeStreamPath(stream, requestPath) {
  const normalizedRequestPath = normalizePath(requestPath);

  if (normalizedRequestPath === stream.publicPath) {
    return '';
  }

  return normalizedRequestPath.slice(stream.publicPath.length + 1);
}

function normalizePath(value) {
  if (!value.startsWith('/')) {
    return `/${value}`;
  }

  if (value.length > 1 && value.endsWith('/')) {
    return value.slice(0, -1);
  }

  return value;
}

function stripTrailingSlash(value) {
  if (value.endsWith('/')) {
    return value.slice(0, -1);
  }

  return value;
}
