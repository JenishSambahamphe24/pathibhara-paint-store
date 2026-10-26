import { ApiClient } from "#/lib/api";

import { TokenRefreshHelper } from "./tokenRefresh.helper";

// Hooks rather than imports keep ApiClient free of an auth import cycle. Both
// are skipped for the login/refresh calls, so a refresh can't recurse.
ApiClient.getAuthToken = () => TokenRefreshHelper.ensureFreshToken();
ApiClient.onUnauthorized = () => TokenRefreshHelper.refresh();
