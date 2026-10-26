import bcrypt from "bcrypt";
import { singleton } from "tsyringe";

import { ConfigService } from "#config";

@singleton()
export class PasswordService {
  // Compared against when the email is unknown, so a miss costs the same
  // bcrypt time as a wrong password and timing doesn't reveal which emails exist.
  private dummyHash: Promise<string> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.configService.authPassword.bcryptCost);
  }

  async verify(plaintext: string, hash: string | null | undefined): Promise<boolean> {
    if (hash) return bcrypt.compare(plaintext, hash);
    this.dummyHash ??= this.hash("timing-equaliser");
    await bcrypt.compare(plaintext, await this.dummyHash);
    return false;
  }
}
