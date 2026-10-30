import type { AuthenticatedRequest } from "../auth/auth.types";
import type { DtoType } from "@repo/http-kit";
import type { Request } from "express";

import {
  ApiResponse,
  Body,
  Controller,
  CreatedResponse,
  Get,
  OkResponse,
  PaginatedOkResponse,
  PaginatedResponse,
  Params,
  Post,
  Put,
  Query,
  Req,
  UseMiddleware,
  Validate,
} from "@repo/http-kit";

import { tk } from "#i18n/tk";

import { requireAdmin } from "../auth/auth.middleware";
import { IdParamsDto } from "../common/id-params.dto";
import {
  PostDetailDto,
  PostInputDto,
  PostListItemDto,
  PostListQueryDto,
  PostPublishDto,
} from "./post.dto";
import { PostService } from "./post.service";

@Controller("/admin/posts", ["Blog"])
@UseMiddleware(requireAdmin())
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get("/", { summary: "List blog posts" })
  @PaginatedOkResponse(PostListItemDto, "Posts")
  @Validate({ query: PostListQueryDto })
  async list(@Query() query: DtoType<typeof PostListQueryDto>) {
    const { items, pagination } = await this.postService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Post("/", { summary: "Create a draft post" })
  @CreatedResponse(PostDetailDto, "Created")
  @Validate({ body: PostInputDto })
  async create(@Body() body: DtoType<typeof PostInputDto>, @Req() req: Request) {
    const data = await this.postService.create(body, (req as AuthenticatedRequest).auth.adminId);
    return ApiResponse.created(data, tk("post.created"));
  }

  @Get("/:id", { summary: "One post with both languages" })
  @OkResponse(PostDetailDto, "Post")
  @Validate({ params: IdParamsDto })
  async get(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.postService.get(params.id));
  }

  @Put("/:id", { summary: "Save a post's content" })
  @OkResponse(PostDetailDto, "Saved")
  @Validate({ params: IdParamsDto, body: PostInputDto })
  async update(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof PostInputDto>,
  ) {
    return ApiResponse.ok(await this.postService.update(params.id, body), tk("post.saved"));
  }

  @Post("/:id/publish", { summary: "Publish (optionally back-dated)" })
  @OkResponse(PostDetailDto, "Published")
  @Validate({ params: IdParamsDto, body: PostPublishDto })
  async publish(
    @Params() params: DtoType<typeof IdParamsDto>,
    @Body() body: DtoType<typeof PostPublishDto>,
  ) {
    return ApiResponse.ok(await this.postService.publish(params.id, body), tk("post.published"));
  }

  @Post("/:id/unpublish", { summary: "Back to draft" })
  @OkResponse(PostDetailDto, "Unpublished")
  @Validate({ params: IdParamsDto })
  async unpublish(@Params() params: DtoType<typeof IdParamsDto>) {
    return ApiResponse.ok(await this.postService.unpublish(params.id), tk("post.unpublished"));
  }
}
