const KEY = "lucky3dp-session";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
