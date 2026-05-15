# Stream Configuration

StreamPass is driven by simple JSON instructions.

Config file:

```text
config/streams.json
```

## Example

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

## Fields

### name

Human readable stream name.

### publicPath

The path viewers request from StreamPass.

Example:

```text
/live/birdfeeder
```

A request for this:

```text
/live/birdfeeder/index.m3u8
```

will map to the configured route base URL plus:

```text
index.m3u8
```

### timeoutMs

Maximum time to wait before trying the next route.

### routes

Ordered list of routes to try before origin fallback.

### allowOriginFallback

Controls whether StreamPass can hit the origin directly.

Use false when you want to protect the origin.

Use true only when direct origin fallback is acceptable.

### origin

Origin route used only when allowOriginFallback is true.
