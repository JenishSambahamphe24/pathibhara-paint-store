import type { IStoragePutInput, IStoragePutResult } from "./storage.service";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";

import { injectable } from "tsyringe";

import { ConfigService } from "#config";

import { StorageService } from "./storage.service";

@injectable()
export class LocalStorageService extends StorageService {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async put(input: IStoragePutInput): Promise<IStoragePutResult> {
    const ext = extname(input.originalName)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, "");
    const key = `${input.prefix}/${randomUUID()}${ext}`;
    const absolutePath = join(this.root, key);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.body);
    return { provider: "local", key };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.root, key));
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }

  getUrl(key: string): string {
    return `${this.configService.storage.publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  private get root(): string {
    return resolve(this.configService.storage.localRoot);
  }
}
