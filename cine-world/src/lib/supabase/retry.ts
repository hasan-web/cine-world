import "server-only";

/**
 * Retries a Supabase query when it fails with a clock-skew rejection — a freshly-minted JWT
 * (right after sign-in) can briefly look "issued in the future" to whichever node validates it,
 * if that node's clock lags the one that signed the token by even a moment. It's not a real auth
 * failure and it resolves itself within a second or two, so this is worth retrying rather than
 * surfacing as a hard error — especially since the first page a brand-new signup ever loads is
 * exactly when a token is freshest and this is most likely to fire.
 *
 * Takes the query function itself (not its result) since a fresh PostgrestFilterBuilder has to be
 * built and awaited fresh on each attempt — awaiting once and retrying the same promise would just
 * re-await the same already-settled rejection.
 */
export async function withClockSkewRetry<T extends { error: { message: string } | null }>(
  run: () => PromiseLike<T>,
): Promise<T> {
  let result = await run();
  for (const delayMs of [300, 800]) {
    if (!result.error || !result.error.message.toLowerCase().includes("issued")) break;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await run();
  }
  return result;
}
