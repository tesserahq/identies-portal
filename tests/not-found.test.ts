import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequestHandler, type ServerBuild } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Regression test for https://github.com/tesserahq/identies-portal/issues/108
 *
 * Unmatched URLs used to return 500 because the root ErrorBoundary read
 * `requestInfo` from root loader data, which doesn't exist when no route matches.
 */
const BUILD_PATH = resolve(__dirname, '../build/server/index.js')

let handler: (request: Request) => Promise<Response>

beforeAll(async () => {
  if (!existsSync(BUILD_PATH)) {
    throw new Error('Server build not found. Run `bun run build` first.')
  }
  const build = (await import(/* @vite-ignore */ pathToFileURL(BUILD_PATH).href)) as ServerBuild
  handler = createRequestHandler(build, 'production')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('unknown URLs', () => {
  it.each(['/config', '/.env', '/vendor.js'])(
    '%s returns 404 without a root loader error',
    async (path) => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const response = await handler(new Request(`http://localhost${path}`))

      expect(response.status).toBe(404)

      const logged = consoleError.mock.calls.flat().map(String).join('\n')
      expect(logged).not.toContain('No request info found in Root loader')
    }
  )
})
