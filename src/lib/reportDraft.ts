const STORAGE_KEY = "report-form:last-values";

export interface RememberedReportValues {
  reporterName: string;
  province: string;
  district: string;
  centerName: string;
}

type StoredMap = Record<string, RememberedReportValues>;

function readAll(): StoredMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredMap) : {};
  } catch {
    return {};
  }
}

/**
 * New reports are usually filed back-to-back for the same
 * province/district/center by the same person, so a fresh form
 * pre-fills these repeated fields from the user's last submission
 * instead of asking for them again every time.
 */
export function getLastReportValues(userId: string): RememberedReportValues | null {
  return readAll()[userId] ?? null;
}

export function rememberLastReportValues(userId: string, values: RememberedReportValues) {
  try {
    const all = readAll();
    all[userId] = values;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage can throw (private mode, quota) — losing the
    // autofill convenience is fine, the report itself already saved.
  }
}
