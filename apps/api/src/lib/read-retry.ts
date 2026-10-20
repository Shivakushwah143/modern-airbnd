import { classifyDatabaseError } from "./errors.js";
import { logger } from "./logger.js";

export type ReadRetryOptions = {
  operation: string;
  requestId?: string;
  signal?: AbortSignal;
  maxAttempts?: number;
  deadlineMs?: number;
  /** Test hook. Production uses bounded jittered exponential backoff. */
  delay?: (attempt: number, remainingMs: number) => number;
};

function abortError() {
  return new Error("Request cancelled.", { cause: "REQUEST_CANCELLED" });
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(done, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    function done() {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function jitteredBackoff(attempt: number, remainingMs: number) {
  const cap = Math.min(500 * 2 ** (attempt - 1), 1500, remainingMs);
  return Math.max(0, Math.floor(cap * (0.5 + Math.random() * 0.5)));
}

/**
 * Retries only an explicitly labelled, idempotent read. Mutations must never
 * call this helper because an ambiguous write could duplicate business data.
 */
export async function withReadRetry<T>(
  operation: () => Promise<T>,
  options: ReadRetryOptions,
): Promise<T> {
  const startedAt = performance.now();
  const maxAttempts = options.maxAttempts ?? 2;
  const deadlineMs = options.deadlineMs ?? 12000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) throw abortError();
    try {
      const data = await operation();
      logger.info(
        {
          component: "database",
          operation: options.operation,
          attempt,
          durationMs: Math.round(performance.now() - startedAt),
          requestId: options.requestId,
        },
        "database read completed",
      );
      return data;
    } catch (error) {
      if (options.signal?.aborted) throw abortError();
      const classification = classifyDatabaseError(error);
      const elapsedMs = performance.now() - startedAt;
      const remainingMs = deadlineMs - elapsedMs;
      const shouldRetry =
        classification?.retryable &&
        attempt < maxAttempts &&
        remainingMs > 0 &&
        !options.signal?.aborted;

      logger.warn(
        {
          component: "database",
          operation: options.operation,
          attempt,
          durationMs: Math.round(elapsedMs),
          code: classification?.code,
          prismaCode: classification?.prismaCode,
          retrying: shouldRetry,
          requestId: options.requestId,
        },
        "database read failed",
      );

      if (!shouldRetry) throw error;
      const delay = Math.min(
        options.delay?.(attempt, remainingMs) ?? jitteredBackoff(attempt, remainingMs),
        remainingMs,
      );
      await wait(delay, options.signal);
    }
  }

  throw new Error("Read retry loop exited unexpectedly.");
}
