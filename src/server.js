import http from 'node:http';
import { loadStreamConfig } from './config.js';
import { handleStreamRequest } from './gateway.js';
import { renderViewerPage } from './viewer.js';

const port = Number.parseInt(process.env.PORT || '8787', 10);
const streams = await loadStreamConfig();

const server = http.createServer(async (nodeRequest, nodeResponse) => {
  try {
    const request = toWebRequest(nodeRequest);
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return sendText(nodeResponse, 200, 'StreamPass is running. Open /view/birdfeeder\n');
    }

    if (url.pathname.startsWith('/view/')) {
      const streamName = decodeURIComponent(url.pathname.slice('/view/'.length));
      return sendHtml(nodeResponse, 200, renderViewerPage(streamName));
    }

    const streamResponse = await handleStreamRequest(request, streams);

    if (streamResponse) {
      return sendWebResponse(nodeResponse, streamResponse);
    }

    return sendText(nodeResponse, 404, 'Not found.\n');
  } catch (error) {
    return sendText(nodeResponse, 500, `StreamPass error: ${error.message}\n`);
  }
});

server.listen(port, () => {
  process.stdout.write(`StreamPass listening on http://localhost:${port}\n`);
});

function toWebRequest(nodeRequest) {
  const host = nodeRequest.headers.host || `localhost:${port}`;
  const url = `http://${host}${nodeRequest.url}`;
  const headers = new Headers();

  for (const [name, value] of Object.entries(nodeRequest.headers)) {
    if (Array.isArray(value)) {
      headers.set(name, value.join(', '));
    } else if (typeof value === 'string') {
      headers.set(name, value);
    }
  }

  return new Request(url, {
    method: nodeRequest.method || 'GET',
    headers
  });
}

async function sendWebResponse(nodeResponse, webResponse) {
  nodeResponse.statusCode = webResponse.status;
  nodeResponse.statusMessage = webResponse.statusText;

  for (const [name, value] of webResponse.headers) {
    nodeResponse.setHeader(name, value);
  }

  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }

  const buffer = Buffer.from(await webResponse.arrayBuffer());
  nodeResponse.end(buffer);
}

function sendText(nodeResponse, statusCode, body) {
  nodeResponse.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' });
  nodeResponse.end(body);
}

function sendHtml(nodeResponse, statusCode, body) {
  nodeResponse.writeHead(statusCode, { 'content-type': 'text/html; charset=utf-8' });
  nodeResponse.end(body);
}
