/**
 * Bin-code comparison shared by pick-path routing (the real walk order) and the Options editor's
 * preview (see PickPathSortPreview). Kept in one place so both stay in sync.
 *
 * Default behavior (no sortKey, or an unparsable one): a natural, segment-aware comparison of the
 * FULL bin code — letters alphabetically (A < B < C), embedded numbers numerically (2 < 10). This
 * is what pick-path.ts always did before the configurable sort key was added; it must stay the
 * silent fallback so existing customers see no behavior change.
 *
 * Configurable behavior: an admin-authored sortKey is a comma-separated list of tokens describing
 * sort-key priority over a bin code's dash-delimited segments:
 *   - "sN"       — the Nth segment (1-based) as a whole, natural-compared.
 *   - "sN.alpha" — that segment's leading non-digit run (case-insensitive alpha compare).
 *   - "sN.num"   — that segment's trailing digit run, parsed as a number (numeric compare).
 * Missing segments/parts default to "" / 0. e.g. "s1.num,s1.alpha" reorders single-segment codes
 * like A1/B1/C1 so bin position outranks the aisle letter: A1, B1, C1, A2, B2, C2, ...
 *
 * Any token that doesn't match the grammar invalidates the whole expression (falls back to
 * default) rather than throwing — a fat-fingered config must never break picking.
 */

const TOKEN_PATTERN = /^s([1-9]\d*)(\.(alpha|num))?$/;

type SortToken = {
  segmentIndex: number; // 0-based
  part: "whole" | "alpha" | "num";
};

/** Parses a comma-separated sortKey expression; returns null if empty or invalid. */
export function parseSortKeyTokens(sortKey?: string | null): SortToken[] | null {
  if (!sortKey || !sortKey.trim()) {
    return null;
  }

  const parts = sortKey.split(",").map((t) => t.trim());
  const tokens: SortToken[] = [];

  for (const part of parts) {
    const match = TOKEN_PATTERN.exec(part);
    if (!match) {
      return null;
    }
    tokens.push({
      segmentIndex: parseInt(match[1], 10) - 1,
      part: (match[3] as "alpha" | "num" | undefined) ?? "whole",
    });
  }

  return tokens.length > 0 ? tokens : null;
}

function splitSegment(segment: string | undefined): { alpha: string; num: number } {
  if (!segment) {
    return {alpha: "", num: 0};
  }
  const match = /^(\D*)(\d*)$/.exec(segment);
  return {
    alpha: match?.[1] ?? segment,
    num: match?.[2] ? parseInt(match[2], 10) : 0,
  };
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"});
}

/**
 * Physical walk order: a natural, segment-aware comparison of the FULL bin code by default, or a
 * configurable priority over dash-delimited segments (and their alpha/number parts) when sortKey
 * is set. Blank/unknown codes always sort last regardless of sortKey.
 */
export function compareBinCodes(a: string | null | undefined, b: string | null | undefined, sortKey?: string | null): number {
  if (!a) return b ? 1 : 0;
  if (!b) return -1;

  const tokens = parseSortKeyTokens(sortKey);
  if (!tokens) {
    return naturalCompare(a, b);
  }

  const segmentsA = a.split("-");
  const segmentsB = b.split("-");

  for (const token of tokens) {
    const segA = segmentsA[token.segmentIndex];
    const segB = segmentsB[token.segmentIndex];

    if (token.part === "whole") {
      const cmp = naturalCompare(segA ?? "", segB ?? "");
      if (cmp !== 0) return cmp;
      continue;
    }

    const partsA = splitSegment(segA);
    const partsB = splitSegment(segB);

    if (token.part === "num") {
      const cmp = partsA.num - partsB.num;
      if (cmp !== 0) return cmp;
    } else {
      const cmp = naturalCompare(partsA.alpha, partsB.alpha);
      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

/** Sorts a list of bin codes for preview purposes (see PickPathSortPreview). */
export function sortBinCodes(codes: string[], sortKey?: string | null): string[] {
  return [...codes].sort((a, b) => compareBinCodes(a, b, sortKey));
}
