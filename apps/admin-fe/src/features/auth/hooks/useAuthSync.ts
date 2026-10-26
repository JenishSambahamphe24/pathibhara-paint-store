import { useRouteContext } from "@tanstack/react-router";

import { authStore } from "../store/authStore";

export function useAuthSync() {
  const { admin } = useRouteContext({ from: "__root__" });

  if (admin && !authStore.state.admin) {
    authStore.setState(() => ({ isAuthenticated: true, admin }));
  }
}
