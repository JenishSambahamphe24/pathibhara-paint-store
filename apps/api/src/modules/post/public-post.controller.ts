import type { DtoType } from "@repo/http-kit";

import {
  ApiResponse,
  Controller,
  Get,
  NotFoundResponse,
  OkResponse,
  PaginatedOkResponse,
  PaginatedResponse,
  Params,
  Query,
  Validate,
} from "@repo/http-kit";

import { SlugParamsDto } from "../common/slug-params.dto";
import { PublicPostDto, PublicPostListItemDto, PublicPostListQueryDto } from "./post.dto";
import { PublicPostService } from "./public-post.service";

@Controller("/public/posts", ["Public"])
export class PublicPostController {
  constructor(private readonly publicPostService: PublicPostService) {}

  @Get("/", { summary: "Published blog posts, newest first" })
  @PaginatedOkResponse(PublicPostListItemDto, "Posts")
  @Validate({ query: PublicPostListQueryDto })
  async list(@Query() query: DtoType<typeof PublicPostListQueryDto>) {
    const { items, pagination } = await this.publicPostService.list(query);
    return new PaginatedResponse(items, pagination);
  }

  @Get("/:slug", { summary: "One published post with its rendered HTML" })
  @OkResponse(PublicPostDto, "Post")
  @NotFoundResponse("No published post has this slug; try /public/redirects")
  @Validate({ params: SlugParamsDto })
  async get(@Params() params: DtoType<typeof SlugParamsDto>) {
    return ApiResponse.ok(await this.publicPostService.getBySlug(params.slug));
  }
}
