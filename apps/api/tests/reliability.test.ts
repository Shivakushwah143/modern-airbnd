import { describe, expect, it } from "vitest";
import { classifyDatabaseError } from "../src/lib/errors.js";
import { withReadRetry } from "../src/lib/read-retry.js";

describe("database dependency classification", () => {
  it.each([
    ["P1001", "DB_UNAVAILABLE"],
    ["P1002", "DB_TIMEOUT"],
    ["P2024", "DB_POOL_TIMEOUT"],
  ] as const)("maps %s to a retryable 503", (prismaCode, code) => {
    expect(classifyDatabaseError({ errorCode: prismaCode })).toMatchObject({
      code,
      status: 503,
      retryable: true,
      prismaCode,
    });
  });

  it("leaves unknown errors unclassified", () => {
    expect(classifyDatabaseError(new Error("unexpected"))).toBeNull();
  });
});

describe("safe read retry", () => {
  const options = { operation: "test.read", delay: () => 0, deadlineMs: 1000 };

  it("recovers exactly once after a transient first attempt", async () => {
    let calls = 0;
    const result = await withReadRetry(async () => {
      calls += 1;
      if (calls === 1) throw { errorCode: "P1001" };
      return "recovered";
    }, options);
    expect(result).toBe("recovered");
    expect(calls).toBe(2);
  });

  it("does not retry permanent or unclassified failures", async () => {
    let calls = 0;
    await expect(
      withReadRetry(async () => {
        calls += 1;
        throw new Error("validation failed");
      }, options),
    ).rejects.toThrow("validation failed");
    expect(calls).toBe(1);
  });

  it("stops before retry when caller cancels", async () => {
    const controller = new AbortController();
    let calls = 0;
    await expect(
      withReadRetry(
        async () => {
          calls += 1;
          controller.abort();
          throw { errorCode: "P1001" };
        },
        { ...options, signal: controller.signal },
      ),
    ).rejects.toThrow("Request cancelled");
    expect(calls).toBe(1);
  });
});
