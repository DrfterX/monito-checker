// Monito Checker — Type Definitions
// Subset of monito SaaS types, extracted for standalone package

/** HTTP method for health checks */
export type HttpMethod = 'HEAD' | 'GET'

/** Monitor status */
export type MonitorStatus = 'unknown' | 'up' | 'down' | 'deleted'

/** A monitored endpoint */
export interface Monitor {
  id: string
  url: string
  name: string | null
  method: HttpMethod
  timeout_ms: number
  check_interval: number
  status: MonitorStatus
  consecutive_failures: number
  last_check_at: string | null
  last_status_code: number | null
  last_response_time_ms: number | null
  alert_email: string | null
  slack_webhook_url: string | null
  api_key_id: string | null
  user_id: string | null
  is_public: number
  created_at: string
  updated_at: string
}

/** A single health check result */
export interface Check {
  id: string
  monitor_id: string
  status_code: number | null
  response_time_ms: number | null
  error_msg: string | null
  checked_at: string
}

/** Result of a single health check execution */
export interface CheckResult {
  success: boolean
  statusCode: number | null
  responseTime: number
  error: string | null
}