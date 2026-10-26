import type { admins } from "@repo/database";
import type { InferSelectModel } from "drizzle-orm";

import { injectable } from "tsyringe";

import { AdminRepository } from "./admin.repository";

export type AdminRecord = InferSelectModel<typeof admins>;

@injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  findByEmail(email: string): Promise<AdminRecord | undefined> {
    return this.adminRepository.findByEmail(email);
  }

  findById(id: string): Promise<AdminRecord | undefined> {
    return this.adminRepository.findById(id);
  }

  async findActiveById(id: string): Promise<AdminRecord | undefined> {
    const admin = await this.adminRepository.findById(id);
    return admin?.status === "active" ? admin : undefined;
  }

  touchLastLogin(id: string, at: Date): Promise<void> {
    return this.adminRepository.touchLastLogin(id, at);
  }
}
