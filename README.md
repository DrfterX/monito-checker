# Monito Checker

**Zero-dependency HTTP health check engine** — use programmatically, via CLI, or deploy your own self-hosted Cloudflare Worker.

```
npm install monito-checker
```

---

## Features

- ✅ **Single endpoint check** — `checkMonitor()` with timeout, redirect-follow, rate-limit detection
- ✅ **Batch concurrent checks** — `checkAllMonitors()` with configurable concurrency limit (default 5)
- ✅ **CLI** — Manage your monito monitors from the terminal (`monito add`, `list`, `status`, `remove`)
- ✅ **Zero dependencies** — Uses only built-in `fetch`, `AbortController`, `performance`
- ✅ **Self-hostable** — Deploy as your own Worker with `wrangler deploy`
- ✅ **TypeScript first** — Full type definitions included

## Usage

### As a library

```typescript
import { checkMonitor, checkAllMonitors } from 'monito-checker'
import type { Monitor } from 'monito-checker'

// Check a single endpoint
const result = await checkMonitor({
  id: 'api-1',
  url: 'https://api.example.com/health',
  method: 'GET',
  timeout_ms: 10000,
  check_interval: 300,
  status: 'unknown',
  consecutive_failures: 0,
  name: null,
  last_check_at: null,
  last_status_code: null,
  last_response_time_ms: null,
  alert_email: null,
  slack_webhook_url: null,
  api_key_id: null,
  user_id: null,
  is_public: 0,
  created_at: '',
  updated_at: '',
})

console.log(result)
// { success: true, statusCode: 200, responseTime: 123, error: null }

// Check multiple endpoints concurrently (batched)
const results = await checkAllMonitors(monitors, 5)
for (const { monitorId, result } of results) {
  console.log(`${monitorId}: ${result.success ? 'UP' : 'DOWN'} (${result.responseTime}ms)`)
}
```

### CLI

```bash
# Install globally
npm install -g monito-checker

# Or use with npx
npx monito-checker login <your-api-key>

# Commands
monito add https://example.com/health --name "My API"
monito list
monito status
monito remove <monitor-id>
monito login <api-key>
monito --help

# Self-hosted instance
# Set custom API base in ~/.config/monito/config.json:
# { "apiBase": "https://your-worker.example.com", "apiKey": "..." }
```

## Self-Hosted Worker

Deploy your own health check Worker:

```bash
# 1. Create a new Worker project
npx wrangler init my-checker
cd my-checker

# 2. Install monito-checker
npm install monito-checker

# 3. Set up your monitors as environment variables
#    (see example/worker.ts for the full example)

# 4. Deploy
npx wrangler deploy

# 5. Test
curl https://my-checker.example.com/check
```

See [`example/worker.ts`](./example/worker.ts) for a minimal working example, or [`src/worker-bootstrap.ts`](./src/worker-bootstrap.ts) for a more complete template with CRON support.

### Using with Cloudflare D1 + KV

For persistent check history and state management, configure D1 and KV in your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "monito-db"
database_id = "YOUR_DATABASE_ID"

[[kv_namespaces]]
binding = "MONITO_STATE"
id = "YOUR_KV_NAMESPACE_ID"
```

## API

### `checkMonitor(monitor: Monitor): Promise<CheckResult>`

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` if HTTP status is 2xx-4xx |
| `statusCode` | `number \| null` | HTTP response status code |
| `responseTime` | `number` | Response time in milliseconds |
| `error` | `string \| null` | Error message on failure |

### `checkAllMonitors(monitors: Monitor[], concurrency?: number): Promise<Array<{monitorId: string, result: CheckResult}>>`

Runs `checkMonitor` for each monitor in batches of `concurrency` (default 5).

## Types

### `Monitor`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `url` | `string` | Endpoint URL to check |
| `method` | `'HEAD' \| 'GET'` | HTTP method |
| `timeout_ms` | `number` | Request timeout in milliseconds |
| `check_interval` | `number` | Check interval in seconds (informational) |
| `status` | `'unknown' \| 'up' \| 'down' \| 'deleted'` | Current status |
| `consecutive_failures` | `number` | Running failure count |

### `CheckResult`

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether the check was successful |
| `statusCode` | `number \| null` | HTTP response status code |
| `responseTime` | `number` | Response time in milliseconds |
| `error` | `string \| null` | Error message on failure |

## License

MIT — see [LICENSE](./LICENSE).

---

**Built for [monito](https://monito.yycomyy.workers.dev)** — self-hostable, anti-BetterStack API health monitoring.