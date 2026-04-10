/**
 * Generates a unique order number in format: L3DP-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit alphanumeric string.
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `L3DP-${date}-${suffix}`;
}
