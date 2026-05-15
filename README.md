# StreamPass

StreamPass is a simple video passthrough gateway powered by After Cloudflare routing ideas.

It gives any project one clean video URL while the gateway handles timeout aware routing, fallback delivery, and protected origin access.

## What It Does

```text
Viewer
  |
StreamPass
  |
  |---- Primary video route
  |---- Secondary video route
  |---- Peer assisted route
  |---- Origin fallback, only when allowed
```

StreamPass is intentionally small. It is not trying to be a full camera platform. It is an instruction gateway for video passthrough.

## Good First Uses

```text
bird feeder cameras
wildlife cameras
workshop cameras
small event streams
local camera networks
simple HLS passthrough demos
```

## Core Behavior

```text
Viewer requests a public stream path
StreamPass loads the stream rule
StreamPass tries the configured routes in order
If a route times out, StreamPass tries the next route
If a route returns 403, 404, 429, or 5xx, StreamPass tries the next route
If every route fails, StreamPass uses origin only when origin fallback is allowed
```

## Quick Start

```bash
npm install
npm test
npm start
```

Default server:

```text
http://localhost:8787
```

Default demo viewer:

```text
http://localhost:8787/view/birdfeeder
```

Default demo stream path:

```text
http://localhost:8787/live/birdfeeder/index.m3u8
```

## Stream Configuration

Stream rules live in:

```text
config/streams.json
```

Example:

```json
{
  "streams": [
    {
      "name": "birdfeeder",
      "publicPath": "/live/birdfeeder",
      "type": "hls",
      "timeoutMs": 1200,
      "allowOriginFallback": false,
      "routes": [
        {
          "name": "primary",
          "baseUrl": "http://localhost:9001/live/birdfeeder"
        },
        {
          "name": "secondary",
          "baseUrl": "http://localhost:9002/live/birdfeeder"
        }
      ],
      "origin": {
        "baseUrl": "http://localhost:9000/live/birdfeeder"
      }
    }
  ]
}
```

## Project Layout

```text
config/          Stream route instructions
src/             Gateway server and routing logic
public/          Simple viewer page
tests/           Node test suite
docs/            Setup and stream config notes
examples/        Example stream definitions
```

## Relationship To After Cloudflare

After Cloudflare is the larger edge routing concept.

StreamPass is the small video specific gateway that proves the idea with practical stream passthrough.

## License

MIT
