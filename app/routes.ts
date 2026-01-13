import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),
  // Update User
  route('/resources/update-user', 'routes/resources/update-user.ts'),

  route('/', 'routes/index.tsx'),

  // Private Layout
  layout('layouts/private.layout.tsx', [
    route('/preferences', 'routes/main/preferences/layout.tsx', [
      index('routes/main/preferences/index.tsx'),
    ]),

    route('/api-keys', 'routes/main/api-keys/layout.tsx', [
      index('routes/main/api-keys/index.tsx'),
      route('new', 'routes/main/api-keys/new.tsx'),
      route(':id', 'routes/main/api-keys/detail.tsx'),
      route(':id/edit', 'routes/main/api-keys/edit.tsx'),
    ]),

    route('/service-accounts', 'routes/main/service-accounts/layout.tsx', [
      index('routes/main/service-accounts/index.tsx'),
      route('new', 'routes/main/service-accounts/new.tsx'),
      route(':id/edit', 'routes/main/service-accounts/edit.tsx'),
      route(':id', 'routes/main/service-accounts/detail/layout.tsx', [
        index('routes/main/service-accounts/detail/index.tsx'),
        route('overview', 'routes/main/service-accounts/detail/overview.tsx'),

        // Api Keys
        route('api-keys', 'routes/main/service-accounts/detail/api-keys/index.tsx'),
        route('api-keys/new', 'routes/main/service-accounts/detail/api-keys/new.tsx'),
        route('api-keys/:apiKeyId', 'routes/main/service-accounts/detail/api-keys/detail.tsx'),
      ]),
    ]),
  ]),
] satisfies RouteConfig
