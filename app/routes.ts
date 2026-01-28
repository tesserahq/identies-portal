import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),
  // Update User
  route('/resources/update-user', 'routes/resources/update-user.ts'),

  route('/', 'routes/index.tsx'),

  // Private Layout
  layout('layouts/private.layout.tsx', [
    route('/accounts', 'routes/main/accounts/layout.tsx', [
      index('routes/main/accounts/index.tsx'),

      route('preferences', 'routes/main/accounts/preferences/layout.tsx', [
        index('routes/main/accounts/preferences/index.tsx'),
      ]),

      route('api-keys', 'routes/main/accounts/api-keys/layout.tsx', [
        index('routes/main/accounts/api-keys/index.tsx'),
        route('new', 'routes/main/accounts/api-keys/new.tsx'),
        route(':id', 'routes/main/accounts/api-keys/detail.tsx'),
        route(':id/edit', 'routes/main/accounts/api-keys/edit.tsx'),
      ]),
    ]),

    route('/users', 'routes/main/users/layout.tsx', [
      index('routes/main/users/index.tsx'),
      route(':id', 'routes/main/users/detail/layout.tsx', [
        index('routes/main/users/detail/index.tsx'),
        route('overview', 'routes/main/users/detail/overview.tsx'),
      ]),
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
        route('api-keys/:apiKeyId/edit', 'routes/main/service-accounts/detail/api-keys/edit.tsx'),
      ]),
    ]),
  ]),
] satisfies RouteConfig
