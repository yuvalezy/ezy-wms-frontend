/**
 * Bin-code comparison shared by pick-path routing (the real walk order) and the Options editor's
 * preview. Kept in one place so both stay in sync.
 *
 * This understands the warehouse bin-code STRUCTURE rather than sorting the raw string or blindly
 * indexing dash-segments (an earlier index-based approach broke because every code shares a
 * constant `01-` zone prefix). A code such as `01-A1-00-05` decomposes as:
 *
 *   ZONE(01) - AISLE(A) + FLOOR(1) - LEVEL(00) - SECTION(05)
 *
 * and the physical walk order is:
 *   1. floor group: all floor-1 aisles, then the hueco (HU) racks, then all floor-2 aisles
 *   2. within a group: aisle letter ascending (HU racks by their number: HU1 < HU2 < ...)
 *   3. within an aisle: section ascending, taking every shelf level at each bay (section-first),
 *      or — when sectionFirst is false — a whole shelf level across the aisle before the next level
 *   4. `01-SYSTEM-BIN-LOCATION` and any code we can't parse sort LAST
 *
 * The two knobs come from Options (PickPathHuecoPrefix / PickPathSectionFirst) so a differently
 * named warehouse can adjust without a code change; the defaults reproduce the reference order.
 */

export interface BinSortOptions {
  /** Aisle letter-part that walks BETWEEN floor 1 and floor 2 (default "HU"). Empty disables it. */
  huecoPrefix?: string;
  /** true: walk sections along the aisle taking all shelf levels per bay. false: level-first. */
  sectionFirst?: boolean;
}

const DEFAULT_HUECO_PREFIX = "HU";

// Floor buckets, in walk order. Lower sorts first.
const BUCKET_FLOOR1 = 0;
const BUCKET_HUECO = 1;
const BUCKET_FLOOR2 = 2;
const BUCKET_OTHER = 3;
const BUCKET_SENTINEL = 9; // unparseable / system bins — always last

interface BinKey {
  bucket: number;
  letter: string; // aisle letter part, upper-cased ("" for sentinels)
  num: number; // aisle trailing number (floor for normal aisles, rack # for hueco)
  section: number;
  level: number;
  raw: string; // original code, for a stable final tie-break
}

/** Split an aisle segment like "A1" or "HU3" into its leading letters and trailing number. */
function splitAisle(segment: string): { letter: string; num: number } | null {
  const match = /^([A-Za-z]+)(\d*)$/.exec(segment);
  if (!match) {
    return null;
  }
  return {
    letter: match[1].toUpperCase(),
    num: match[2] ? parseInt(match[2], 10) : 0,
  };
}

function toKey(code: string, huecoPrefix: string): BinKey {
  const sentinel: BinKey = {bucket: BUCKET_SENTINEL, letter: "", num: 0, section: 0, level: 0, raw: code};
  if (!code) {
    return sentinel;
  }

  const segments = code.split("-");
  // Aisle = first segment containing a letter. This auto-skips any constant numeric zone prefix
  // ("01"), however many precede it — the exact thing that broke the old index-based sort.
  const aisleIdx = segments.findIndex((s) => /[A-Za-z]/.test(s));
  if (aisleIdx === -1) {
    return sentinel;
  }

  const aisle = splitAisle(segments[aisleIdx]);
  if (!aisle) {
    return sentinel;
  }

  // The two segments after the aisle are LEVEL then SECTION. If they aren't both numeric this isn't
  // a structured location code (e.g. "01-SYSTEM-BIN-LOCATION") — sort it last, deterministically.
  const levelSeg = segments[aisleIdx + 1];
  const sectionSeg = segments[aisleIdx + 2];
  if (!isNumeric(levelSeg) || !isNumeric(sectionSeg)) {
    return sentinel;
  }

  let bucket: number;
  if (huecoPrefix && aisle.letter === huecoPrefix.toUpperCase()) {
    bucket = BUCKET_HUECO;
  } else if (aisle.num === 1) {
    bucket = BUCKET_FLOOR1;
  } else if (aisle.num === 2) {
    bucket = BUCKET_FLOOR2;
  } else {
    bucket = BUCKET_OTHER;
  }

  return {
    bucket,
    letter: aisle.letter,
    num: aisle.num,
    level: parseInt(levelSeg, 10),
    section: parseInt(sectionSeg, 10),
    raw: code,
  };
}

function isNumeric(s: string | undefined): s is string {
  return s != null && s !== "" && /^\d+$/.test(s);
}

/**
 * Compare two bin codes by the physical walk order described at the top of this file. Blank/unknown
 * codes always sort last. `opts` (huecoPrefix / sectionFirst) comes from Options; omitting it uses
 * the reference defaults.
 */
export function compareBinCodes(
  a: string | null | undefined,
  b: string | null | undefined,
  opts?: BinSortOptions,
): number {
  // Preserve the historical "blank sorts last" contract cheaply before structural parsing.
  if (!a) return b ? 1 : 0;
  if (!b) return -1;

  const huecoPrefix = opts?.huecoPrefix ?? DEFAULT_HUECO_PREFIX;
  const sectionFirst = opts?.sectionFirst ?? true;

  const ka = toKey(a, huecoPrefix);
  const kb = toKey(b, huecoPrefix);

  if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
  // Both sentinels (or same bucket): fall through to a stable natural compare of the whole code.
  if (ka.bucket === BUCKET_SENTINEL) return naturalCompare(ka.raw, kb.raw);

  if (ka.letter !== kb.letter) return naturalCompare(ka.letter, kb.letter);
  if (ka.num !== kb.num) return ka.num - kb.num; // HU1 < HU2 < ...; floor constant within a bucket

  const primary = sectionFirst ? ka.section - kb.section : ka.level - kb.level;
  if (primary !== 0) return primary;
  const secondary = sectionFirst ? ka.level - kb.level : ka.section - kb.section;
  if (secondary !== 0) return secondary;

  return 0;
}

function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"});
}

/** Sorts a list of bin codes by the walk order (used by tests / preview). */
export function sortBinCodes(codes: string[], opts?: BinSortOptions): string[] {
  return [...codes].sort((a, b) => compareBinCodes(a, b, opts));
}
