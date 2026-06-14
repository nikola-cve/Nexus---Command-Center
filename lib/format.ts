const TZ = "Europe/Belgrade";

/** Time in the owner's timezone (Belgrade). */
export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour12: false, timeZone: TZ });
}

/** Date and time in the owner's timezone (Belgrade). */
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", { hour12: false, timeZone: TZ });
}

export function nowClock(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: TZ }) + " Belgrade";
}
