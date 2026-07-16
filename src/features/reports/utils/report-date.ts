/**
 * Date serialization for report filter values.
 *
 * **Every value stays a string, all the way to the wire.** The backend parses strictly and rejects
 * rather than coercing, and binds each value as a typed `SqlParameter` — so pre-converting here
 * (e.g. sending a JS number, or a `Date`) would only make the client's guess authoritative and
 * defeat that. The one job these helpers have is producing *honest* strings.
 *
 * Dates are the sharp edge: a `Date` picked from the calendar is local midnight, and
 * `toISOString().slice(0, 10)` on it yields the **previous day** for every viewer east of UTC
 * (local midnight Jul 16 at UTC+2 is Jul 15 22:00Z). A filter that silently shifts a day is how a
 * report shows the wrong week's invoices, so dates are serialized from their local calendar
 * components and parsed back the same way.
 *
 * These live in `utils/` rather than beside the filter bar because the query-string parser needs
 * them too, and `utils/ → components/` is the wrong direction. `ReportFilterBar` re-exports
 * `toIsoDate`/`fromIsoDate` so its public surface is unchanged.
 */

const pad = (value: number): string => String(value).padStart(2, "0");

/** `Date` → `yyyy-MM-dd` using the **local** calendar fields. Never `toISOString()`. See module docs. */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * `yyyy-MM-dd` → a local-midnight `Date`. Deliberately not `new Date("2026-07-16")`, which the spec
 * says to read as **UTC** midnight — that renders as the 15th in any negative offset.
 *
 * Note this does **not** reject an impossible calendar date: `new Date(2026, 1, 31)` rolls over to
 * Mar 3 rather than returning an invalid date. Callers that must reject `2026-02-31` should check
 * `toIsoDate(fromIsoDate(v)) === v` — see {@link isCalendarDate}.
 */
export const fromIsoDate = (value: string | null | undefined): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return undefined;
  }
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/** `<input type="datetime-local">` omits seconds; the backend parses ISO exactly, so normalize. */
export const normalizeDateTime = (value: string): string =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;

/**
 * True when `value` is a real `yyyy-MM-dd` calendar date.
 *
 * The round-trip is the whole point: a regex accepts `2026-02-31`, and `fromIsoDate` silently rolls
 * it forward to Mar 3 — so a date picker would cheerfully display **March 3** while the value sent
 * to SQL Server says February 31st. Only a date that survives parse-and-reformat unchanged is real.
 */
export const isCalendarDate = (value: string): boolean => {
  const parsed = fromIsoDate(value);
  return parsed !== undefined && toIsoDate(parsed) === value;
};

/**
 * True when `value` is a real `yyyy-MM-ddTHH:mm(:ss)?` local datetime.
 * Validates the date half with {@link isCalendarDate} and range-checks the clock fields.
 */
export const isCalendarDateTime = (value: string): boolean => {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) {
    return false;
  }
  const [hours, minutes, seconds] = [match[2], match[3], match[4] ?? "00"].map(Number);
  return isCalendarDate(match[1]) && hours <= 23 && minutes <= 59 && seconds <= 59;
};
