import {buildPickPath} from "./pick-path";
import {PickingDocumentDetailItem, PickingDocumentDetailItemBinQuantities} from "@/features/picking/data/picking";

function bin(entry: number, code: string, quantity: number, sequence?: number): PickingDocumentDetailItemBinQuantities {
  return {entry, code, quantity, sequence};
}

function item(
  itemCode: string,
  overrides: Partial<PickingDocumentDetailItem> = {},
): PickingDocumentDetailItem {
  return {
    itemCode,
    itemName: `${itemCode} name`,
    numInBuy: 1,
    purPackUn: 1,
    quantity: 12,
    picked: 0,
    openQuantity: 12,
    ...overrides,
  };
}

describe("buildPickPath", () => {
  test("returns an empty path for no items", () => {
    const path = buildPickPath(undefined);
    expect(path.stops).toEqual([]);
    expect(path.totalStops).toBe(0);
    expect(path.totalQuantity).toBe(0);
    expect(path.pickedQuantity).toBe(0);
  });

  test("orders stops by backend sequence (P10 after P9), not alphabetically", () => {
    const items = [
      item("A", {binQuantities: [bin(3, "BIN-P10-A1-N1", 6, 10_001_001)]}),
      item("B", {binQuantities: [bin(1, "BIN-P9-A1-N1", 6, 9_001_001)]}),
      item("C", {binQuantities: [bin(2, "BIN-P2-A1-N1", 6, 2_001_001)]}),
    ];

    const codes = buildPickPath(items).stops.map((s) => s.binCode);
    expect(codes).toEqual(["BIN-P2-A1-N1", "BIN-P9-A1-N1", "BIN-P10-A1-N1"]);
  });

  test("falls back to numeric-aware code compare when sequence is missing", () => {
    const items = [
      item("A", {binQuantities: [bin(3, "BIN-P10-A1-N1", 6)]}),
      item("B", {binQuantities: [bin(1, "BIN-P9-A1-N1", 6)]}),
    ];
    const codes = buildPickPath(items).stops.map((s) => s.binCode);
    expect(codes).toEqual(["BIN-P9-A1-N1", "BIN-P10-A1-N1"]);
  });

  test("an item stocked in multiple bins appears at each of its stops", () => {
    const items = [
      item("A", {
        binQuantities: [
          bin(1, "BIN-P1-A1-N1", 6, 1_001_001),
          bin(2, "BIN-P1-A2-N1", 6, 1_002_001),
        ],
      }),
    ];
    const path = buildPickPath(items);
    expect(path.totalStops).toBe(2);
    expect(path.stops[0].items[0].itemCode).toBe("A");
    expect(path.stops[0].items[0].quantityToPick).toBe(6);
    expect(path.stops[1].items[0].itemCode).toBe("A");
  });

  test("groups several items at the same bin into one stop", () => {
    const items = [
      item("A", {binQuantities: [bin(1, "BIN-P1-A1-N1", 6, 1_001_001)]}),
      item("B", {binQuantities: [bin(1, "BIN-P1-A1-N1", 4, 1_001_001)]}),
    ];
    const path = buildPickPath(items);
    expect(path.totalStops).toBe(1);
    expect(path.stops[0].items.map((i) => i.itemCode)).toEqual(["A", "B"]);
    expect(path.stops[0].totalQuantityToPick).toBe(10);
  });

  test("marks the first stop as the next one to walk to", () => {
    const items = [
      item("A", {binQuantities: [bin(2, "BIN-P2-A1-N1", 6, 2_001_001)]}),
      item("B", {binQuantities: [bin(1, "BIN-P1-A1-N1", 6, 1_001_001)]}),
    ];
    const stops = buildPickPath(items).stops;
    expect(stops[0].binCode).toBe("BIN-P1-A1-N1");
    expect(stops[0].isNext).toBe(true);
    expect(stops[1].isNext).toBe(false);
    expect(stops.map((s) => s.position)).toEqual([1, 2]);
  });

  test("collects still-open items with no bin into a trailing 'no bin' stop", () => {
    const items = [
      item("A", {binQuantities: [bin(1, "BIN-P1-A1-N1", 6, 1_001_001)]}),
      item("B", {openQuantity: 5, binQuantities: []}),
    ];
    const path = buildPickPath(items);
    expect(path.totalStops).toBe(2);
    const last = path.stops[path.stops.length - 1];
    expect(last.binCode).toBeNull();
    expect(last.binEntry).toBeNull();
    expect(last.items[0].itemCode).toBe("B");
    expect(last.items[0].quantityToPick).toBe(5);
  });

  test("ignores bins with zero available quantity and fully-picked no-bin items", () => {
    const items = [
      item("A", {picked: 12, openQuantity: 0, binQuantities: [bin(1, "BIN-P1-A1-N1", 0, 1_001_001)]}),
      item("B", {picked: 12, openQuantity: 0, binQuantities: []}),
    ];
    const path = buildPickPath(items);
    expect(path.totalStops).toBe(0);
  });

  test("reports overall picked/total progress across all items", () => {
    const items = [
      item("A", {quantity: 12, picked: 6, openQuantity: 6, binQuantities: [bin(1, "BIN-P1-A1-N1", 6, 1_001_001)]}),
      item("B", {quantity: 8, picked: 8, openQuantity: 0, binQuantities: []}),
    ];
    const path = buildPickPath(items);
    expect(path.totalQuantity).toBe(20);
    expect(path.pickedQuantity).toBe(14);
  });
});
