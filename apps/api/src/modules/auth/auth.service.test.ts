import "reflect-metadata";

import type { AdminRecord } from "../admin/admin.service";
import type { SessionRecord } from "../session/session.service";

import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it } from "vitest";

import { ForbiddenException, UnauthorizedException } from "@repo/http-kit";

import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

const PASSWORD = "correct-horse";

const config = {
  authJwt: {
    accessSecret: "a".repeat(32),
    refreshSecret: "r".repeat(32),
    accessTtlSeconds: 900,
    refreshTtlSeconds: 3600,
  },
  authPassword: { bcryptCost: 4 },
};

class FakeAdminService {
  readonly admins = new Map<string, AdminRecord>();

  findByEmail(email: string) {
    return Promise.resolve([...this.admins.values()].find((a) => a.email === email));
  }

  findById(id: string) {
    return Promise.resolve(this.admins.get(id));
  }

  findActiveById(id: string) {
    const admin = this.admins.get(id);
    return Promise.resolve(admin?.status === "active" ? admin : undefined);
  }

  touchLastLogin() {
    return Promise.resolve();
  }
}

class FakeSessionService {
  readonly sessions = new Map<string, SessionRecord>();

  create(input: Pick<SessionRecord, "adminId" | "refreshTokenHash" | "expiresAt">) {
    const now = new Date();
    const row: SessionRecord = {
      id: crypto.randomUUID(),
      ipAddress: null,
      userAgent: null,
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    this.sessions.set(row.id, row);
    return Promise.resolve(row);
  }

  findById(id: string) {
    return Promise.resolve(this.sessions.get(id));
  }

  findByRefreshHash(hash: string) {
    return Promise.resolve([...this.sessions.values()].find((s) => s.refreshTokenHash === hash));
  }

  rotateRefresh(params: { id: string; refreshTokenHash: string; expiresAt: Date }) {
    const row = this.sessions.get(params.id);
    if (row) Object.assign(row, params);
    return Promise.resolve(row);
  }

  revoke(id: string) {
    const row = this.sessions.get(id);
    if (row) row.revokedAt = new Date();
    return Promise.resolve();
  }
}

function makeAdmin(overrides: Partial<AdminRecord> = {}): AdminRecord {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    email: "owner@example.com",
    name: "Owner",
    passwordHash: bcrypt.hashSync(PASSWORD, 4),
    status: "active",
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("AuthService", () => {
  let admins: FakeAdminService;
  let sessions: FakeSessionService;
  let service: AuthService;

  beforeEach(() => {
    admins = new FakeAdminService();
    sessions = new FakeSessionService();
    service = new AuthService(
      { run: (fn: () => Promise<unknown>) => fn() } as never,
      admins as never,
      sessions as never,
      new PasswordService(config as never),
      new TokenService(config as never),
      config as never,
    );
  });

  it("issues tokens and a session on valid credentials", async () => {
    const admin = makeAdmin();
    admins.admins.set(admin.id, admin);

    const result = await service.login({ email: admin.email, password: PASSWORD });

    expect(result.admin.id).toBe(admin.id);
    expect(result.expiresIn).toBe(900);
    expect(sessions.sessions.size).toBe(1);
    const [session] = sessions.sessions.values();
    expect(session.refreshTokenHash).not.toMatch(/^pending-/);
  });

  it("rejects a wrong password and an unknown email the same way", async () => {
    const admin = makeAdmin();
    admins.admins.set(admin.id, admin);

    await expect(service.login({ email: admin.email, password: "nope" })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(
      service.login({ email: "ghost@example.com", password: PASSWORD }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.sessions.size).toBe(0);
  });

  it("refuses a blocked admin even with the right password", async () => {
    const admin = makeAdmin({ status: "blocked" });
    admins.admins.set(admin.id, admin);

    await expect(service.login({ email: admin.email, password: PASSWORD })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rotates the refresh token and rejects the old one", async () => {
    const admin = makeAdmin();
    admins.admins.set(admin.id, admin);
    const first = await service.login({ email: admin.email, password: PASSWORD });

    const second = await service.refresh({ refreshToken: first.refreshToken });

    expect(second.refreshToken).not.toBe(first.refreshToken);
    await expect(service.refresh({ refreshToken: first.refreshToken })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("rejects refresh after logout", async () => {
    const admin = makeAdmin();
    admins.admins.set(admin.id, admin);
    const tokens = await service.login({ email: admin.email, password: PASSWORD });
    const [session] = sessions.sessions.values();

    await service.logout(session.id);

    await expect(service.refresh({ refreshToken: tokens.refreshToken })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
