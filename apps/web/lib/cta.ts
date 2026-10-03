import type { Availability } from "@modern-airbnd/contracts";
export function stayAction(status: Availability["status"]) {
  switch (status) {
    case "AVAILABLE":
      return { label: "Enquire on WhatsApp", kind: "whatsapp" } as const;
    case "UNAVAILABLE":
      return { label: "Change Dates", kind: "dates" } as const;
    case "UNKNOWN":
      return { label: "Retry Availability", kind: "retry" } as const;
    default:
      return { label: "Check Availability", kind: "dates" } as const;
  }
}
