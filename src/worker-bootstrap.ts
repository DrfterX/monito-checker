// Monito Checker — Worker Self-Build Template
// Import this file to run health checks in your own Cloudflare Worker.
//
// Quick start:
//   1. npm install monito-checker
//   2. Copy this file into your Worker project
//   3. wrangler deploy

import { checkAllMonitors, type Monitor } from 'monito-checker'

interface Env {
  MONITORS?: string  // JSON array of Monitor objects
  CHECK_CONCURRENCY?: string
}

/**
 * Example scheduled handler — runs health checks on CRON trigger.
 * Configure in wrangler.toml:
 *   [triggers]
 *   crons = ["*/5 * * * *"]
 */
export async function scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
  if (!env.MONITORS) {
    console.log('No MONITORS configured — add a JSON array of Monitor objects to env vars.')
    return
  }

  let monitors: Monitor[]
  try {
    monitors = JSON.parse(env.MONITORS)
  } catch {
    console.error('MONITORS env var is not valid JSON')
    return
  }

  const concurrency = parseInt(env.CHECK_CONCURRENCY || '5', 10)
  const results = await checkAllMonitors(monitors, concurrency)

  for (const { monitorId, result } of results) {
    const icon = result.success ? '✅' : '❌'
    const status = result.success ? `UP (${result.statusCode})` : `DOWN — ${result.error}`
    console.log(`${icon} ${monitorId} ${status} ${result.responseTime}ms`)
  }
}

/**
 * Example fetch handler — exposes health check results via HTTP.
 * GET /check — runs checks and returns JSON results
 */
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (new URL(req.url).pathname !== '/check') {
      return new Response('Not found', { status: 404 })
    }

    if (!env.MONITORS) {
      return Response.json({ error: 'MONITORS not configured' }, { status: 500 })
    }

    let monitors: Monitor[]
    try {
      monitors = JSON.parse(env.MONITORS)
    } catch {
      return Response.json({ error: 'MONITORS env var is not valid JSON' }, { status: 500 })
    }

    const concurrency = parseInt(env.CHECK_CONCURRENCY || '5', 10)
    const results = await checkAllMonitors(monitors, concurrency)

    return Response.json({
      checked: results.length,
      timestamp: new Date().toISOString(),
      results,
    })
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(scheduled(event, env, ctx))
  },
}