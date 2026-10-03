import { z } from "zod";
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00.000Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Enter a valid calendar date.");
export const toDate = (s: string) => new Date(`${s}T00:00:00.000Z`);
export const todayIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const searchSchema = z
  .object({
    location: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    checkIn: dateSchema.optional(),
    checkOut: dateSchema.optional(),
  })
  .superRefine((q, c) => {
    if (!!q.checkIn !== !!q.checkOut)
      c.addIssue({
        code: "custom",
        message: "Choose both check-in and check-out.",
        path: ["checkOut"],
      });
    if (q.checkIn && q.checkOut && q.checkOut <= q.checkIn)
      c.addIssue({
        code: "custom",
        message: "Check-out must be after check-in.",
        path: ["checkOut"],
      });
    if (q.checkIn && q.checkIn < todayIndia())
      c.addIssue({
        code: "custom",
        message: "Check-in cannot be in the past.",
        path: ["checkIn"],
      });
  });
export const overlaps = (
  start: string,
  end: string,
  blockStart: string,
  blockEnd: string,
) => start < blockEnd && end > blockStart;
export function availability(
  units: { id: string }[],
  blocked: Set<string>,
  evaluated: boolean,
) {
  if (!evaluated) return { status: "NOT_EVALUATED" as const };
  const availableUnits = units.filter((u) => !blocked.has(u.id)).length;
  return {
    status: availableUnits ? ("AVAILABLE" as const) : ("UNAVAILABLE" as const),
    availableUnits,
  };
}
