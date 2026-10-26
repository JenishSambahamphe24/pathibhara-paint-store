import type { StorageService } from "../storage/storage.service";
import type { FileRow } from "./file.repository";
import type { DtoType } from "@repo/http-kit";
import type { UploadedFile } from "#helpers/multipart.middleware";

import { inject, injectable } from "tsyringe";

import { LoggerService, ValidationException } from "@repo/http-kit";

import { BlurHashHelper } from "#helpers/blur-hash.helper";
import { tk } from "#i18n/tk";

import { STORAGE_SERVICE } from "../storage/storage.service";
import { FileResponseDto } from "./file.dto";
import { FileRepository } from "./file.repository";

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

@injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    @inject(STORAGE_SERVICE) private readonly storage: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async uploadImage(input: {
    file: UploadedFile;
    prefix: string;
    altText?: string;
    uploadedBy: string;
  }): Promise<DtoType<typeof FileResponseDto>> {
    const meta = await BlurHashHelper.fromBuffer(input.file.buffer);
    const put = await this.storage.put({
      body: input.file.buffer,
      originalName: input.file.originalName,
      prefix: input.prefix,
    });

    try {
      const row = await this.fileRepository.create({
        provider: put.provider,
        key: put.key,
        originalName: input.file.originalName,
        mimeType: input.file.mimeType,
        sizeBytes: input.file.sizeBytes,
        width: meta.width,
        height: meta.height,
        blurHash: meta.blurHash,
        altText: input.altText || null,
        uploadedBy: input.uploadedBy,
      });
      return this.toDto(row);
    } catch (err) {
      // The row is the source of truth; don't leave an object nothing points at.
      await this.storage.delete(put.key).catch((deleteErr: unknown) => {
        this.logger.warn({ key: put.key, deleteErr }, "Upload rollback failed to delete object");
      });
      throw err;
    }
  }

  // Throws a field error naming `field` when any id doesn't exist.
  async assertExist(ids: Array<string>, field: string): Promise<void> {
    const unique = [...new Set(ids)];
    const found = await this.fileRepository.findByIds(unique);
    if (found.length !== unique.length) {
      throw new ValidationException({ [field]: tk("file.notFound") });
    }
  }

  toDto(row: FileRow): DtoType<typeof FileResponseDto> {
    return FileResponseDto.parse({
      id: row.id,
      url: this.storage.getUrl(row.key),
      originalName: row.originalName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      width: row.width,
      height: row.height,
      blurHash: row.blurHash,
      altText: row.altText,
    });
  }
}
