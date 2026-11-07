import { isNotFound, isRedirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ApiError } from "#/lib/apiError";

import { SeoApi } from "../api";
import { SlugRedirectHelper } from "./slugRedirect.helper";

// Mocked so the test never reads env or touches the network.
vi.mock("../api", () => ({ SeoApi: { currentSlug: vi.fn() } }));

const currentSlug = vi.mocked(SeoApi.currentSlug);

function notFoundError() {
  return new ApiError({ message: "Not found" }, 404);
}

async function thrownBy(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("expected the promise to reject");
}

describe("SlugRedirectHelper.loadBySlug", () => {
  beforeEach(() => currentSlug.mockReset());

  test("returns the record without a redirect lookup when it loads", async () => {
    const data = await SlugRedirectHelper.loadBySlug("product", "gloss", () =>
      Promise.resolve({ name: "Gloss" }),
    );

    expect(data).toEqual({ name: "Gloss" });
    expect(currentSlug).not.toHaveBeenCalled();
  });

  test("answers an old slug with a 301 to the current URL", async () => {
    currentSlug.mockResolvedValue("satin-gloss");

    const error = await thrownBy(
      SlugRedirectHelper.loadBySlug("product", "gloss", () =>
        Promise.reject(notFoundError()),
      ),
    );

    expect(currentSlug).toHaveBeenCalledWith("product", "gloss");
    expect(isRedirect(error)).toBe(true);
    expect((error as Response).status).toBe(301);
    expect((error as { options: { href: string } }).options.href).toBe(
      "/products/satin-gloss",
    );
  });

  test("throws notFound when no redirect exists", async () => {
    currentSlug.mockResolvedValue(null);

    const error = await thrownBy(
      SlugRedirectHelper.loadBySlug("post", "gone", () =>
        Promise.reject(notFoundError()),
      ),
    );

    expect(isNotFound(error)).toBe(true);
  });

  test("lets other API failures through untouched", async () => {
    const failure = new ApiError({ message: "Down" }, 503);

    const error = await thrownBy(
      SlugRedirectHelper.loadBySlug("category", "primer", () =>
        Promise.reject(failure),
      ),
    );

    expect(error).toBe(failure);
    expect(currentSlug).not.toHaveBeenCalled();
  });
});
