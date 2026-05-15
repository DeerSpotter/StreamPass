import test from 'node:test';
import assert from 'node:assert/strict';
import { findStreamRule } from '../src/config.js';
import { buildAttempts, buildTargetUrl, handleStreamRequest, shouldFailover } from '../src/gateway.js';

const streams = [
  {
    name: 'birdfeeder',
    publicPath: '/live/birdfeeder',
    type: 'hls',
    timeoutMs: 25,
    allowOriginFallback: false,
    routes: [
      { name: 'primary', baseUrl: 'http://primary.test/live/birdfeeder' },
      { name: 'secondary', baseUrl: 'http://secondary.test/live/birdfeeder' }
    ],
    origin: { baseUrl: 'http://origin.test/live/birdfeeder' }
  }
];

test('findStreamRule matches configured public path', () => {
  const rule = findStreamRule(streams, '/live/birdfeeder/index.m3u8');
  assert.equal(rule.name, 'birdfeeder');
});

test('buildTargetUrl preserves stream relative path and query string', () => {
  const url = buildTargetUrl('http://primary.test/live/birdfeeder', 'index.m3u8', '?v=1');
  assert.equal(url.toString(), 'http://primary.test/live/birdfeeder/index.m3u8?v=1');
});

test('shouldFailover returns true for blocked, missing, rate limited, and server error statuses', () => {
  assert.equal(shouldFailover(403), true);
  assert.equal(shouldFailover(404), true);
  assert.equal(shouldFailover(429), true);
  assert.equal(shouldFailover(500), true);
  assert.equal(shouldFailover(502), true);
  assert.equal(shouldFailover(503), true);
  assert.equal(shouldFailover(504), true);
  assert.equal(shouldFailover(200), false);
});

test('handleStreamRequest falls back from primary 503 to secondary 200', async () => {
  const request = new Request('http://localhost/live/birdfeeder/index.m3u8');
  const seen = [];

  const response = await handleStreamRequest(request, streams, async (url) => {
    seen.push(url.toString());

    if (url.hostname === 'primary.test') {
      return new Response('primary failed', { status: 503 });
    }

    return new Response('#EXTM3U', { status: 200 });
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-streampass-route'), 'secondary');
  assert.equal(await response.text(), '#EXTM3U');
  assert.deepEqual(seen, [
    'http://primary.test/live/birdfeeder/index.m3u8',
    'http://secondary.test/live/birdfeeder/index.m3u8'
  ]);
});

test('handleStreamRequest falls back after timeout', async () => {
  const request = new Request('http://localhost/live/birdfeeder/index.m3u8');

  const response = await handleStreamRequest(request, streams, async (url, options) => {
    if (url.hostname === 'primary.test') {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 100);
        options.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('aborted'));
        });
      });
    }

    return new Response('#EXTM3U', { status: 200 });
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-streampass-route'), 'secondary');
});

test('buildAttempts does not include origin unless fallback is explicitly allowed', () => {
  const attempts = buildAttempts(streams[0]);
  assert.deepEqual(attempts.map((attempt) => attempt.name), ['primary', 'secondary']);
});

test('buildAttempts includes origin when fallback is explicitly allowed', () => {
  const attempts = buildAttempts({
    ...streams[0],
    allowOriginFallback: true
  });

  assert.deepEqual(attempts.map((attempt) => attempt.name), ['primary', 'secondary', 'origin']);
});
