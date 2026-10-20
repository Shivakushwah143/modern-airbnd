import { Prisma } from "@prisma/client";

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public retryable = false,
  ) {
    super(message);
  }
}

export type DatabaseErrorClassification = {
  code: "DB_UNAVAILABLE" | "DB_TIMEOUT" | "DB_POOL_TIMEOUT";
  status: 503;
  message: string;
  retryable: true;
  prismaCode: "P1001" | "P1002" | "P2024";
};

function prismaCode(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Prisma.PrismaClientInitializationError)
    return error.errorCode;
  if (
    error &&
    typeof error === "object" &&
    "errorCode" in error &&
    typeof error.errorCode === "string"
  )
    return error.errorCode;
  return undefined;
}

/** Safe public mapping. Original Prisma messages stay in server diagnostics. */
export function classifyDatabaseError(
  error: unknown,
): DatabaseErrorClassification | null {
  const code = prismaCode(error);
  if (code === "P1001")
    return {
      code: "DB_UNAVAILABLE",
      status: 503,
      message: "This service is temporarily unavailable.",
      retryable: true,
      prismaCode: code,
    };
  if (code === "P1002")
    return {
      code: "DB_TIMEOUT",
      status: 503,
      message: "This service is temporarily unavailable.",
      retryable: true,
      prismaCode: code,
    };
  if (code === "P2024")
    return {
      code: "DB_POOL_TIMEOUT",
      status: 503,
      message: "This service is temporarily unavailable.",
      retryable: true,
      prismaCode: code,
    };
  return null;
}
export function found<T>(value: T | null | undefined): T {
  if (!value)
    throw new AppError(
      404,
      "RESOURCE_NOT_FOUND",
      "This item could not be found.",
    );
  return value;
}
