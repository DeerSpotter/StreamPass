# Setup

StreamPass only needs Node.js 18 or newer.

## Install

```bash
git clone https://github.com/DeerSpotter/StreamPass.git
cd StreamPass
npm install
```

## Run Tests

```bash
npm test
```

## Start Gateway

```bash
npm start
```

Default server:

```text
http://localhost:8787
```

Open the demo viewer:

```text
http://localhost:8787/view/birdfeeder
```

## Configure Streams

Edit:

```text
config/streams.json
```

Each stream needs:

```text
name
publicPath
timeoutMs
routes
origin, only used when allowOriginFallback is true
```

## Minimal HLS Source

StreamPass expects video segments to already exist somewhere.

A simple HLS source usually has:

```text
index.m3u8
segment0001.ts
segment0002.ts
segment0003.ts
```

Then StreamPass passes those files through using the configured routes.
