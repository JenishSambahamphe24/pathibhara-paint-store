import type { sessions } from "@repo/database";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { injectable } from "tsyringe";

import { SessionRepository } from "./session.repository";

export type SessionRecord = InferSelectModel<typeof sessions>;

@injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  create(input: InferInsertModel<typeof sessions>): Promise<SessionRecord> {
    return this.sessionRepository.create(input);
  }

  findById(id: string): Promise<SessionRecord | undefined> {
    return this.sessionRepository.findById(id);
  }

  findByRefreshHash(hash: string): Promise<SessionRecord | undefined> {
    return this.sessionRepository.findByRefreshHash(hash);
  }

  rotateRefresh(params: { id: string; refreshTokenHash: string; expiresAt: Date }) {
    return this.sessionRepository.rotateRefresh(params);
  }

  revoke(id: string): Promise<void> {
    return this.sessionRepository.revoke(id);
  }
}
