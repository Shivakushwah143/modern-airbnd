export function whatsapp(input: {
  number?: string;
  fallback?: string;
  name: string;
  location: string;
  url: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
  guestName?: string;
  phone?: string;
  message?: string;
  unavailable?: boolean;
}) {
  const number = input.number || input.fallback;
  if (!number || !/^\+[1-9]\d{7,14}$/.test(number)) return null;
  const message = [
    `Hi, I am interested in ${input.name} in ${input.location}.`,
    input.checkIn && input.checkOut
      ? `Requested stay: ${input.checkIn} to ${input.checkOut}.`
      : "I would like to know more about availability.",
    input.adults
      ? `Guests: ${input.adults} adult${input.adults === 1 ? "" : "s"}${input.children ? `, ${input.children} children` : ""}.`
      : "",
    input.guestName ? `Guest: ${input.guestName} (${input.phone || ""}).` : "",
    input.message ? `Message: ${input.message}` : "",
    input.unavailable
      ? "The website currently shows this property as unavailable. Do you have alternative dates or a similar property?"
      : "Please let me know the next steps.",
    `Property: ${input.url}`,
  ].filter(Boolean).join("\n\n");
  return `https://wa.me/${number.slice(1)}?text=${encodeURIComponent(message)}`;
}
