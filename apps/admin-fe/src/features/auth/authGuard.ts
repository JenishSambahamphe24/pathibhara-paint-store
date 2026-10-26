import type { IAuthAdmin } from "./types";

import { redirect } from "@tanstack/react-router";

import { AuthApi } from "./api";
import { AUTH_PATHS } from "./constants";
import { authCookies } from "./cookies/authCookies";
import { AuthSession } from "./session.helper";
import { authStore } from "./store/authStore";

interface IAuthGuardOptions {
  location: { pathname: string };
}

interface IAuthGuardResult {
  admin: IAuthAdmin | null;
}

interface ICachedAdmin {
  admin: IAuthAdmin;
  fetchedAt: number;
}

// How long a resolved `/me` is reused across navigations, so clicking around
// doesn't refetch on every route change but a blocked account is noticed soon.
const ADMIN_CACHE_TTL_MS = 30_000;

const adminByToken = new Map<string, ICachedAdmin>();

export class authGuard {
  static async apply({
    location,
  }: IAuthGuardOptions): Promise<IAuthGuardResult> {
    const token = await authCookies.get();
    const hasToken = !!token;
    const isAuthPath = AUTH_PATHS.has(location.pathname);

    if (!isAuthPath && !hasToken) {
      throw redirect({ to: "/login" });
    }

    let admin: IAuthAdmin | null = null;

    if (token) {
      const cached = adminByToken.get(token);
      if (cached && Date.now() - cached.fetchedAt < ADMIN_CACHE_TTL_MS) {
        admin = cached.admin;
      } else {
        try {
          admin = await AuthApi.getMe();
          adminByToken.set(token, { admin, fetchedAt: Date.now() });
        } catch {
          await AuthSession.clear();
          authStore.setState(() => ({ isAuthenticated: false, admin: null }));
          throw redirect({ to: "/login" });
        }
      }
    }

    authStore.setState(() => ({ isAuthenticated: hasToken, admin }));

    if (isAuthPath && hasToken) {
      throw redirect({ to: "/dashboard" });
    }

    return { admin };
  }

  static clearCache() {
    adminByToken.clear();
  }
}
