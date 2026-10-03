export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
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
