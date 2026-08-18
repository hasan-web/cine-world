import "server-only";

/**
 * Retries a Supabase query when it fails, for the handful of queries that run during the critical
 * first render right after sign-in — where a just-minted JWT can briefly look "issued in the
 * future" to whichever node validates it, if that node's clock lags the one that signed the token
 * by even a moment. Confirmed in production (`JWT issued at future`), and confirmed again as a
 * second variant with no message text at all on a different query shape (a count/head request) —
 * so this deliberately does NOT gate on matching specific wording. Supabase's error text for the
 * same underlying skew isn't consistent across query types, and a narrow string match already
 * missed a real case once. Retrying blindly a couple of times is cheap (both attempts are
 * read-only) and self-limiting: a genuinely different failure just surfaces ~1.1s later than it
 * would have, still correctly, instead of silently going unretried.
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
    if (!result.error) break;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await run();
  }
  return result;
}
