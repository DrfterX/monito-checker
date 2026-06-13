// Monito Checker — Minimal Worker Example
// Simplest possible self-hosted health checker.
//
// 1. npm install monito-checker
// 2. Set MONITORS env var to a JSON array of Monitor objects
// 3. wrangler deploy
// 4. curl https://your-worker.example.com/check

import { checkAllMonitors, type Monitor } from 'monito-checker'

interface Env {
  MONITORS: string
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const monitors: Monitor[] = JSON.parse(env.MONITORS)
    const results = await checkAllMonitors(monitors)
    return Response.json({
      ok: true,
      checked: results.length,
      results: results.map(r => ({
        id: r.monitorId,
        up: r.result.success,
        status: r.result.statusCode,
        ms: r.result.responseTime,
        error: r.result.error,
      })),
    })
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const monitors: Monitor[] = JSON.parse(env.MONITORS)
    const results = await checkAllMonitors(monitors)
    for (const r of results) {
      console.log(`${r.result.success ? 'UP' : 'DOWN'}: ${r.monitorId} (${r.result.responseTime}ms)`)
    }
  },
}