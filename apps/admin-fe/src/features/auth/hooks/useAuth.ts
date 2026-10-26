import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";

import { AuthApi } from "../api";
import { authGuard } from "../authGuard";
import { AuthSession } from "../session.helper";
import { authStore } from "../store/authStore";

export function useAuth() {
  const isAuthenticated = useStore(authStore, (s) => s.isAuthenticated);
  const admin = useStore(authStore, (s) => s.admin);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch {
      // best-effort: clear local state even if the BE call fails
    }
    await AuthSession.clear();
    authStore.setState(() => ({ isAuthenticated: false, admin: null }));
    authGuard.clearCache();
    queryClient.clear();
    await navigate({ to: "/login" });
  }, [navigate, queryClient]);

  return { isAuthenticated, admin, logout };
}
