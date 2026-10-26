import { createFileRoute, redirect } from "@tanstack/react-router";

import { authStore } from "#/features/auth/store/authStore";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: authStore.state.isAuthenticated ? "/dashboard" : "/login",
    });
  },
});
