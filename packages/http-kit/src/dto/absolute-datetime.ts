import { z } from "../zod/zod-extended";

/**
 * A datetime that means the same instant everywhere: an ISO string carrying a
 * timezone (`…Z` or `…±hh:mm`), parsed to a `Date`.
 *
 * Use this for every datetime a client sends — never a bare `z.coerce.date()`.
 * `z.coerce.date()` also accepts `2026-08-10T18:06` with no timezone and
 * resolves it in the *server's* zone, so the identical payload means one
 * instant on a developer's machine and another in a UTC container. That drift
 * validates cleanly and surfaces only as stored times wrong by the sender's
 * offset. Requiring the offset makes the ambiguous form a 400 instead.
 *
 * Calendar dates are not instants — a date of birth stays a plain
 * `YYYY-MM-DD` string, because pinning it to a zone can move it a day.
 */
export function absoluteDatetime() {
  return z.iso.datetime({ offset: true }).pipe(z.coerce.date());
}
