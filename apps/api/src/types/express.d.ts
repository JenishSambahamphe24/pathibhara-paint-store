import type { UploadedFile } from "../helpers/multipart.middleware";

declare global {
  namespace Express {
    interface Request {
      files?: UploadedFile[];
    }
  }
}

export {};
