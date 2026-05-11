import { index, layout, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),
  // Update User
  route('/resources/update-user', 'routes/resources/update-user.ts'),
  // Upload Application Logo
  route('/resources/upload-application-logo', 'routes/resources/upload-application-logo.ts'),
  // Proxy Application Logo (avoids cross-origin blocking when displaying external logos)
  route('/resources/proxy-application-logo', 'routes/resources/proxy-application-logo.ts'),

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
        route(':apiKeyID', 'routes/main/accounts/api-keys/detail.tsx'),
        route(':apiKeyID/edit', 'routes/main/accounts/api-keys/edit.tsx'),
      ]),
    ]),

    route('/users', 'routes/main/users/layout.tsx', [
      index('routes/main/users/index.tsx'),
      route(':userID', 'routes/main/users/detail/layout.tsx', [
        index('routes/main/users/detail/index.tsx'),
        route('overview', 'routes/main/users/detail/overview.tsx'),

        route('api-keys', 'routes/main/users/detail/api-keys/index.tsx'),
        route('api-keys/new', 'routes/main/users/detail/api-keys/new.tsx'),
        route('api-keys/:apiKeyID', 'routes/main/users/detail/api-keys/detail.tsx'),
        route('api-keys/:apiKeyID/edit', 'routes/main/users/detail/api-keys/edit.tsx'),
      ]),
    ]),

    route('/service-accounts', 'routes/main/service-accounts/layout.tsx', [
      index('routes/main/service-accounts/index.tsx'),
      route('new', 'routes/main/service-accounts/new.tsx'),
      route(':serviceAccountID/edit', 'routes/main/service-accounts/edit.tsx'),
      route(':serviceAccountID', 'routes/main/service-accounts/detail/layout.tsx', [
        index('routes/main/service-accounts/detail/index.tsx'),
        route('overview', 'routes/main/service-accounts/detail/overview.tsx'),

        // Api Keys
        route('api-keys', 'routes/main/service-accounts/detail/api-keys/index.tsx'),
        route('api-keys/new', 'routes/main/service-accounts/detail/api-keys/new.tsx'),
        route('api-keys/:apiKeyID', 'routes/main/service-accounts/detail/api-keys/detail.tsx'),
        route('api-keys/:apiKeyID/edit', 'routes/main/service-accounts/detail/api-keys/edit.tsx'),
      ]),
    ]),

    route('/applications', 'routes/main/applications/layout.tsx', [
      index('routes/main/applications/index.tsx'),
      route('new', 'routes/main/applications/new.tsx'),
      route(':applicationID/edit', 'routes/main/applications/edit.tsx'),
      route(':applicationID', 'routes/main/applications/detail/layout.tsx', [
        index('routes/main/applications/detail/index.tsx'),
        route('overview', 'routes/main/applications/detail/overview.tsx'),
      ]),
    ]),

    route('/access-rules', 'routes/main/access-rules/layout.tsx', [
      index('routes/main/access-rules/index.tsx'),
      route('new', 'routes/main/access-rules/new.tsx'),
      route(':accessRuleID/edit', 'routes/main/access-rules/edit.tsx'),
      route(':accessRuleID', 'routes/main/access-rules/detail/layout.tsx', [
        index('routes/main/access-rules/detail/index.tsx'),
        route('overview', 'routes/main/access-rules/detail/overview.tsx'),
      ]),
    ]),
  ]),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),
] satisfies RouteConfig
