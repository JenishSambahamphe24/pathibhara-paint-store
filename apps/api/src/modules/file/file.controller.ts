import type { AuthenticatedRequest } from "../auth/auth.types";
import type { DtoType } from "@repo/http-kit";
import type { Request } from "express";

import { container } from "tsyringe";

import {
  ApiResponse,
  BadRequestException,
  Body,
  Controller,
  CreatedResponse,
  Post,
  Req,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { ConfigService } from "#config";
import { MultipartMiddleware } from "#helpers/multipart.middleware";
import { tk } from "#i18n/tk";

import { requireAdmin } from "../auth/auth.middleware";
import { FileResponseDto, UploadImageRequestDto } from "./file.dto";
import { ALLOWED_IMAGE_MIMES, FileService } from "./file.service";

@Controller("/admin/files", ["Files"])
@UseMiddleware(requireAdmin())
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post("/images", { summary: "Upload one image (multipart field `file`)" })
  @CreatedResponse(FileResponseDto, "Uploaded")
  @UseMiddleware((req, res, next) =>
    MultipartMiddleware.images({
      maxFileBytes: container.resolve(ConfigService).storage.maxImageBytes,
      allowedImageMimes: ALLOWED_IMAGE_MIMES,
    })(req, res, next),
  )
  @Validate({ body: UploadImageRequestDto })
  async uploadImage(@Body() body: DtoType<typeof UploadImageRequestDto>, @Req() req: Request) {
    const file = req.files?.find((f) => f.fieldname === "file");
    if (!file) throw new BadRequestException(tk("file.missing"));

    const data = await this.fileService.uploadImage({
      file,
      prefix: body.prefix,
      altText: body.altText,
      uploadedBy: (req as AuthenticatedRequest).auth.adminId,
    });
    return ApiResponse.created(data, tk("file.uploaded"));
  }
}
