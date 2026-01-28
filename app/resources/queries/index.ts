import { NodeENVType } from '@/libraries/fetch'

/**
 * Query configuration
 * Required configuration for API queries (apiUrl, token, nodeEnv)
 */
export interface IQueryConfig {
  apiUrl: string
  token: string
  nodeEnv: NodeENVType
}

/**
 * Query parameters for pagination
 */
export interface IQueryParams {
  page?: number
  size?: number
  q?: string
}
