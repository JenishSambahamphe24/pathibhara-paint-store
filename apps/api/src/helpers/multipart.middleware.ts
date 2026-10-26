import type { NextFunction, Request, RequestHandler, Response } from "express";

import busboy from "busboy";

import { BadRequestException, ValidationException } from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { MimeSniffHelper } from "./mime-sniff.helper";

export interface UploadedFile {
  fieldname: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  sizeBytes: number;
}

export interface MultipartOptions {
  maxFileBytes: number;
  maxFiles?: number;
  allowedImageMimes: readonly string[];
}

// Buffers files in memory (fine at image-sized caps), merges text fields into
// `req.body` so `@Validate({ body })` still works, and puts files on
// `req.files`. Only images whose bytes match an allowed type get through.
export class MultipartMiddleware {
  static images(options: MultipartOptions): RequestHandler {
    const { maxFileBytes, maxFiles = 1, allowedImageMimes } = options;

    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.headers["content-type"]?.includes("multipart/form-data")) {
        next(new BadRequestException(tk("file.multipartExpected")));
        return;
      }

      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: maxFileBytes, files: maxFiles },
      });
      const files: UploadedFile[] = [];
      const fields: Record<string, unknown> = {};
      let aborted = false;

      const fail = (err: Error): void => {
        if (aborted) return;
        aborted = true;
        req.unpipe(bb);
        next(err);
      };

      bb.on("file", (fieldname, stream, info) => {
        const chunks: Buffer[] = [];
        let sizeBytes = 0;

        stream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          sizeBytes += chunk.length;
        });
        stream.on("limit", () => {
          fail(new ValidationException({ [fieldname]: tk("file.tooLarge") }));
        });
        stream.on("end", () => {
          if (aborted) return;
          const buffer = Buffer.concat(chunks);
          const mimeType = MimeSniffHelper.imageType(buffer);
          if (!mimeType || !allowedImageMimes.includes(mimeType)) {
            fail(new ValidationException({ [fieldname]: tk("file.typeNotAllowed") }));
            return;
          }
          files.push({
            fieldname,
            originalName: info.filename ?? "upload",
            mimeType,
            buffer,
            sizeBytes,
          });
        });
        stream.on("error", fail);
      });

      bb.on("field", (name, value) => {
        fields[name] = value;
      });
      bb.on("filesLimit", () => {
        fail(new ValidationException({ file: tk("file.tooMany") }));
      });
      bb.on("error", (err) => {
        fail(err instanceof Error ? err : new Error(String(err)));
      });
      bb.on("close", () => {
        if (aborted) return;
        req.body = { ...fields };
        req.files = files;
        next();
      });

      req.pipe(bb);
    };
  }
}
