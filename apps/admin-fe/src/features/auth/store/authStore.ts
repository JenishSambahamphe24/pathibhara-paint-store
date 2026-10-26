import type { IAuthState } from "../types";

import { Store } from "@tanstack/store";

export const authStore = new Store<IAuthState>({
  isAuthenticated: false,
  admin: null,
});
