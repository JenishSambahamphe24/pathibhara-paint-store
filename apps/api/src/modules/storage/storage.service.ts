import type { FileProvider } from "@repo/shared";

export interface IStoragePutInput {
  body: Buffer;
  originalName: string;
  prefix: string;
}

export interface IStoragePutResult {
  provider: FileProvider;
  key: string;
}

export const STORAGE_SERVICE = Symbol("StorageService");

// Swappable backend for uploaded files. Keys are random and write-once, so a
// replaced image is a new object and old URLs never change content.
export abstract class StorageService {
  abstract put(input: IStoragePutInput): Promise<IStoragePutResult>;
  abstract delete(key: string): Promise<void>;
  abstract getUrl(key: string): string;
}
