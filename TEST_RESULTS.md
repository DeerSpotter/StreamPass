# Test Results

## 2026-05-15

Command tested:

```bash
npm test
```

Result:

```text
TAP version 13
# Subtest: findStreamRule matches configured public path
ok 1 - findStreamRule matches configured public path
# Subtest: buildTargetUrl preserves stream relative path and query string
ok 2 - buildTargetUrl preserves stream relative path and query string
# Subtest: shouldFailover returns true for blocked, missing, rate limited, and server error statuses
ok 3 - shouldFailover returns true for blocked, missing, rate limited, and server error statuses
# Subtest: handleStreamRequest falls back from primary 503 to secondary 200
ok 4 - handleStreamRequest falls back from primary 503 to secondary 200
# Subtest: handleStreamRequest falls back after timeout
ok 5 - handleStreamRequest falls back after timeout
# Subtest: buildAttempts does not include origin unless fallback is explicitly allowed
ok 6 - buildAttempts does not include origin unless fallback is explicitly allowed
# Subtest: buildAttempts includes origin when fallback is explicitly allowed
ok 7 - buildAttempts includes origin when fallback is explicitly allowed
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Status:

```text
PASS
```

Coverage checked:

```text
stream route matching
relative path to target URL mapping
failover status code detection
primary route 503 fallback to secondary route
timeout fallback to secondary route
origin fallback blocked by default
origin fallback included only when explicitly allowed
```

Environment note:

```text
Direct git clone from the test container failed because github.com could not be resolved by DNS in that environment. The test was run locally using the same committed source contents from the initialized StreamPass files.
```
