export function renderViewerPage(streamName) {
  const safeName = escapeHtml(streamName || 'birdfeeder');
  const streamPath = `/live/${encodeURIComponent(streamName || 'birdfeeder')}/index.m3u8`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>StreamPass ${safeName}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #111; color: #eee; }
    main { max-width: 900px; margin: 0 auto; }
    video { width: 100%; background: #000; border-radius: 12px; }
    code { background: #222; padding: 0.2rem 0.4rem; border-radius: 4px; }
  </style>
</head>
<body>
  <main>
    <h1>StreamPass</h1>
    <p>Viewing stream: <code>${safeName}</code></p>
    <video controls autoplay muted playsinline src="${streamPath}"></video>
    <p>Stream path: <code>${streamPath}</code></p>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
