## Upgrade Remix V2 to React Router V7

#### Using codemod

```
npx codemod remix/2/react-router/upgrade
```

#### Install dependecies

```
bun install
```

#### Update scripts on package.json

```typescript
 "scripts": {
    "build": "node ./build.mjs",
    "dev": "node ./server.mjs",
    "start": "cross-env NODE_ENV=production node ./server.mjs",
    "lint": "npx eslint \"{app,lib}/**/*.{ts,tsx}\"",
    "lint:fix": "npx eslint \"{app,lib}/**/*.{ts,tsx}\" --fix",
    "check": "bun run format && bun run lint && bun run typecheck",
    "typecheck": "react-router typegen && tsc",
    "format": "npx prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\" \"!**/locales/**\"",
    "format:check": "npx prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\" \"!**/locales/**\""
  },
```

#### Create file build.mjs in root project

Install dotenv => `bun add dotenv`

```typescript
// Loads dotenv before running the build
import 'dotenv/config'
import { execSync } from 'child_process'

// Executes react-router build with environment variables available
execSync('react-router build', { stdio: 'inherit' })
```

#### Update `vite.config.ts`

```typescript
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig((config) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const aliases: { [key: string]: string } = {
    '@': resolve(__dirname, './app'),
  }

  if (isProduction) {
    aliases['react-dom/server'] = 'react-dom/server.node'
  }

  return {
    resolve: {
      alias: aliases,
    },
    server: {
      port: 3000,
    },
    ssr: {
      optimizeDeps: {
        include: ['react-dom/server.node'],
      },
    },
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  }
})
```

#### Add a `routes.ts` file

`app/routes.ts`

```typescript
import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  route('/', 'routes/index.tsx'),

  layout('layouts/private.layout.tsx', [
    route('/contacts', 'routes/main/contacts/layout.tsx', [
      index('routes/main/contacts/index.tsx'),
      route('new', 'routes/main/contacts/new.tsx'),
      route('imports', 'routes/main/contacts/imports.tsx'),
      route(':id', 'routes/main/contacts/detail.tsx'),
      route(':id/edit', 'routes/main/contacts/edit.tsx'),
    ]),
  ]),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
```

#### Add `.react-router/` to `.gitignore`

```
.react-router/
```

#### Update `tsconfig.json`

```typescript
{
  "include": [
    /* ... */
+   ".react-router/types/**/*"
  ],
  "compilerOptions": {
-   "types": ["@remix-run/node", "vite/client"],
+   "types": ["@react-router/node", "vite/client"],
    /* ... */
+   "rootDirs": [".", "./.react-router/types"]
  }
}
```

#### `app/entry.server.tsx`

```typescript
import { ServerRouter } from "react-router";

<ServerRouter context={remixContext} url={request.url} />,
```

### `app/entry.client.tsx`

```typescript
import { HydratedRouter } from 'react-router/dom'

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
)
```
