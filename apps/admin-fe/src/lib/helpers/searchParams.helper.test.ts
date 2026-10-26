import { describe, expect, test } from "vitest";
import { z } from "zod";

import { SearchParamsHelper } from "./searchParams.helper";

const schema = z.object({
  page: z.coerce.number().int().positive().default(1),
  status: z.enum(["active", "inactive"]).optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
});

describe("SearchParamsHelper.parse", () => {
  test("keeps valid params", () => {
    expect(
      SearchParamsHelper.parse(schema, { page: 3, status: "active" }),
    ).toEqual({
      page: 3,
      status: "active",
      sortBy: "createdAt",
    });
  });

  test("drops only the invalid keys", () => {
    expect(
      SearchParamsHelper.parse(schema, {
        page: -2,
        status: "bogus",
        sortBy: "name",
      }),
    ).toEqual({
      page: 1,
      sortBy: "name",
    });
  });
});
