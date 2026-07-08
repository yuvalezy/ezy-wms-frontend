import {compareBinCodes, parseSortKeyTokens, sortBinCodes} from "./bin-code-sort";

describe("parseSortKeyTokens", () => {
  test("returns null for empty/undefined/whitespace-only expressions", () => {
    expect(parseSortKeyTokens(undefined)).toBeNull();
    expect(parseSortKeyTokens(null)).toBeNull();
    expect(parseSortKeyTokens("")).toBeNull();
    expect(parseSortKeyTokens("   ")).toBeNull();
  });

  test("returns null when any token doesn't match the grammar", () => {
    expect(parseSortKeyTokens("s1,not-a-token")).toBeNull();
    expect(parseSortKeyTokens("s0")).toBeNull(); // segments are 1-based
    expect(parseSortKeyTokens("s1.bogus")).toBeNull();
  });

  test("parses valid whole/alpha/num tokens", () => {
    expect(parseSortKeyTokens("s1,s2.alpha,s3.num")).toEqual([
      {segmentIndex: 0, part: "whole"},
      {segmentIndex: 1, part: "alpha"},
      {segmentIndex: 2, part: "num"},
    ]);
  });
});

describe("compareBinCodes", () => {
  test("blank/unknown codes always sort last, regardless of sortKey", () => {
    expect(compareBinCodes(null, "A1")).toBeGreaterThan(0);
    expect(compareBinCodes("A1", null)).toBeLessThan(0);
    expect(compareBinCodes(null, null)).toBe(0);
    expect(compareBinCodes(null, "A1", "s1.num,s1.alpha")).toBeGreaterThan(0);
  });

  test("default (no sortKey): natural full-string compare, aisle-major", () => {
    expect(compareBinCodes("A1", "A2")).toBeLessThan(0);
    expect(compareBinCodes("A10", "A2")).toBeGreaterThan(0); // numeric, not lexicographic
    expect(compareBinCodes("A2", "B1")).toBeLessThan(0);
  });

  test("invalid sortKey falls back to default natural compare", () => {
    expect(compareBinCodes("A2", "B1", "garbage")).toBeLessThan(0);
  });

  test("s1.num,s1.alpha reorders single-segment letter+number codes to position-major", () => {
    const key = "s1.num,s1.alpha";
    expect(compareBinCodes("A1", "B1", key)).toBeLessThan(0);
    expect(compareBinCodes("B1", "A2", key)).toBeLessThan(0);
    expect(compareBinCodes("A10", "A2", key)).toBeGreaterThan(0); // still numeric
  });

  test("sortBinCodes orders a full demo set position-first", () => {
    const codes = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2"];
    expect(sortBinCodes(codes, "s1.num,s1.alpha")).toEqual([
      "A1", "B1", "C1", "A2", "B2", "C2", "A3", "B3",
    ]);
  });

  test("multi-segment reorder: s2,s1 swaps which dash-segment is primary", () => {
    const key = "s2,s1";
    expect(compareBinCodes("01-A1-10-04", "01-C1-00-16", key)).toBeLessThan(0);
    expect(compareBinCodes("02-A1-00-00", "01-B1-00-00", key)).toBeLessThan(0); // segment 2 ("A1" < "B1") wins over segment 1
  });
});
