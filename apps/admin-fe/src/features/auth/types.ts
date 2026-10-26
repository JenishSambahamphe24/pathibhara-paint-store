import type { AdminStatus } from "@repo/shared";

export interface IAuthAdmin {
  id: string;
  email: string;
  name: string;
  status: AdminStatus;
  lastLoginAt: string | null;
}

export interface IAuthState {
  isAuthenticated: boolean;
  admin: IAuthAdmin | null;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  admin: IAuthAdmin;
}
