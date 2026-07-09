import {compareBinCodes, sortBinCodes} from "./bin-code-sort";

describe("compareBinCodes (structured warehouse order)", () => {
  test("blank/unknown codes always sort last", () => {
    expect(compareBinCodes(null, "01-A1-00-01")).toBeGreaterThan(0);
    expect(compareBinCodes("01-A1-00-01", null)).toBeLessThan(0);
    expect(compareBinCodes(null, null)).toBe(0);
  });

  test("floor group order: all floor-1, then hueco (HU), then floor-2", () => {
    // A2 (floor 2) must come AFTER B1 (floor 1) and after HU — not right after A1.
    expect(compareBinCodes("01-B1-00-01", "01-A2-00-01")).toBeLessThan(0);
    expect(compareBinCodes("01-J1-30-42", "01-HU1-00-01")).toBeLessThan(0); // last floor-1 < first HU
    expect(compareBinCodes("01-HU4-30-10", "01-A2-00-01")).toBeLessThan(0); // last HU < first floor-2
  });

  test("within a floor, aisles order by letter A -> B -> C", () => {
    expect(compareBinCodes("01-A1-00-01", "01-B1-00-01")).toBeLessThan(0);
    expect(compareBinCodes("01-B1-00-01", "01-C1-00-01")).toBeLessThan(0);
  });

  test("hueco racks order by rack number HU1 < HU2 < HU3 < HU4", () => {
    expect(compareBinCodes("01-HU1-00-01", "01-HU2-00-01")).toBeLessThan(0);
    expect(compareBinCodes("01-HU2-00-01", "01-HU10-00-01")).toBeLessThan(0); // numeric, not string
  });

  test("within an aisle, section-first: all shelf levels at a bay before the next bay", () => {
    // A1-00-01 < A1-10-01 < A1-20-01 < A1-30-01 < A1-00-02  (section ascends, level is the tiebreak)
    expect(compareBinCodes("01-A1-00-01", "01-A1-10-01")).toBeLessThan(0);
    expect(compareBinCodes("01-A1-30-01", "01-A1-00-02")).toBeLessThan(0);
  });

  test("sections compared numerically (05 < 07 < 10), not lexically", () => {
    expect(compareBinCodes("01-A1-00-05", "01-A1-00-10")).toBeLessThan(0);
    expect(compareBinCodes("01-A1-00-07", "01-A1-00-10")).toBeLessThan(0);
  });

  test("sectionFirst=false walks a whole shelf level across the aisle first", () => {
    const opts = {sectionFirst: false};
    // level-major: A1-00-01 < A1-00-02 < ... < A1-10-01
    expect(compareBinCodes("01-A1-00-02", "01-A1-10-01", opts)).toBeLessThan(0);
    expect(compareBinCodes("01-A1-00-01", "01-A1-00-02", opts)).toBeLessThan(0);
  });

  test("SYSTEM-BIN-LOCATION and unparseable codes sort last", () => {
    expect(compareBinCodes("01-P2-30-42", "01-SYSTEM-BIN-LOCATION")).toBeLessThan(0);
    expect(compareBinCodes("01-A1-00-01", "garbage")).toBeLessThan(0);
  });

  test("configurable hueco prefix: MEZZ walks between floors", () => {
    const opts = {huecoPrefix: "MEZZ"};
    expect(compareBinCodes("01-J1-00-01", "01-MEZZ1-00-01", opts)).toBeLessThan(0);
    expect(compareBinCodes("01-MEZZ1-00-01", "01-A2-00-01", opts)).toBeLessThan(0);
  });

  test("sortBinCodes produces the full reference order over a representative set", () => {
    const codes = [
      "01-SYSTEM-BIN-LOCATION",
      "01-A2-00-01",
      "01-HU2-00-01",
      "01-A1-10-01",
      "01-A1-00-02",
      "01-A1-00-01",
      "01-B1-00-01",
      "01-HU1-00-01",
      "01-J1-00-01",
      "01-P2-00-01",
    ];
    expect(sortBinCodes(codes)).toEqual([
      "01-A1-00-01",
      "01-A1-10-01",
      "01-A1-00-02",
      "01-B1-00-01",
      "01-J1-00-01",
      "01-HU1-00-01",
      "01-HU2-00-01",
      "01-A2-00-01",
      "01-P2-00-01",
      "01-SYSTEM-BIN-LOCATION",
    ]);
  });
});
