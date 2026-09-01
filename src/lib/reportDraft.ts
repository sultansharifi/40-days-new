const STORAGE_KEY = "report-form:last-values";

export interface RememberedReportValues {
  reporterName: string;
  province: string;
  district: string;
  centerName: string;
}

/**
 * New reports are usually filed back-to-back for the same
 * province/district/center/reporter, so a fresh form pre-fills these
 * repeated fields from the last submission instead of asking for them
 * again every time. There's no login, so this is just one shared
 * "last used" set for this browser rather than per-user.
 */
export function getLastReportValues(): RememberedReportValues | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RememberedReportValues) : null;
  } catch {
    return null;
  }
}

export function rememberLastReportValues(values: RememberedReportValues) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // localStorage can throw (private mode, quota) — losing the
    // autofill convenience is fine, the report itself already saved.
  }
}
