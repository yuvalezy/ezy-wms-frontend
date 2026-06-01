import {
  BinLocationPackageQuantityResponse,
  PickingDocumentDetailItem,
} from "@/features/picking/data/picking";

/**
 * Pick-path routing (frontend, presentation only).
 *
 * The backend stamps each bin with a numeric `sequence` (walk order). Here we just INVERT the
 * item-first payload into a location-first walk: one "stop" per bin, ordered by that sequence,
 * listing the items to grab at each bin. No bin-code parsing happens here — the ordering rule
 * lives once, in the backend `IPickPathSequencer`.
 */

export interface PickPathStopItem {
  itemCode: string;
  itemName: string;
  /** Quantity available to pick at THIS bin. */
  quantityToPick: number;
  /** Item-level totals, for context. */
  picked: number;
  openQuantity: number;
  packages?: BinLocationPackageQuantityResponse[];
  // Unit fields forwarded to useStockInfo for display:
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
  /** Original item, needed by ItemDetailsLink. */
  item: PickingDocumentDetailItem;
}

export interface PickPathStop {
  /** 1-based display order after sorting. */
  position: number;
  binEntry: number | null;
  /** null for the synthetic "no bin location" stop. */
  binCode: string | null;
  items: PickPathStopItem[];
  totalQuantityToPick: number;
  /** First remaining stop in walk order — the one to walk to next. */
  isNext: boolean;
}

export interface PickPath {
  stops: PickPathStop[];
  totalStops: number;
  /** Overall progress across the document (survives bins dropping out as they're picked). */
  totalQuantity: number;
  pickedQuantity: number;
}

// "No bin" items sort after every real bin.
const NO_BIN_SEQUENCE = Number.MAX_SAFE_INTEGER;

interface StopAccumulator {
  binEntry: number | null;
  binCode: string | null;
  sequence: number;
  items: PickPathStopItem[];
}

function toStopItem(item: PickingDocumentDetailItem, quantityToPick: number, packages?: BinLocationPackageQuantityResponse[]): PickPathStopItem {
  return {
    itemCode: item.itemCode,
    itemName: item.itemName,
    quantityToPick,
    picked: item.picked,
    openQuantity: item.openQuantity,
    packages,
    numInBuy: item.numInBuy,
    buyUnitMsr: item.buyUnitMsr,
    purPackUn: item.purPackUn,
    purPackMsr: item.purPackMsr,
    item,
  };
}

/**
 * Sort key for a bin. Prefers the backend `sequence`; falls back to a numeric-aware compare of the
 * code (so P10 still follows P9) only when the backend hasn't supplied a sequence.
 */
function compareStops(a: StopAccumulator, b: StopAccumulator): number {
  if (a.sequence !== b.sequence) {
    return a.sequence - b.sequence;
  }
  const codeA = a.binCode ?? "";
  const codeB = b.binCode ?? "";
  return codeA.localeCompare(codeB, undefined, {numeric: true, sensitivity: "base"});
}

/**
 * Build the ordered walk from the item-first detail. Items with stock in multiple bins contribute a
 * line to each of their bins; items with no bin info but still open are collected into a trailing
 * "no bin location" stop.
 */
export function buildPickPath(items?: PickingDocumentDetailItem[]): PickPath {
  const byBin = new Map<string, StopAccumulator>();
  let noBin: StopAccumulator | null = null;
  let totalQuantity = 0;
  let pickedQuantity = 0;

  for (const item of items ?? []) {
    totalQuantity += item.quantity ?? 0;
    pickedQuantity += item.picked ?? 0;

    const bins = item.binQuantities?.filter((b) => (b.quantity ?? 0) > 0) ?? [];

    if (bins.length === 0) {
      // Still-open item with nowhere to route — surface it so it isn't silently dropped.
      if ((item.openQuantity ?? 0) > 0) {
        noBin ??= {binEntry: null, binCode: null, sequence: NO_BIN_SEQUENCE, items: []};
        noBin.items.push(toStopItem(item, item.openQuantity));
      }
      continue;
    }

    for (const bin of bins) {
      const key = String(bin.entry);
      let acc = byBin.get(key);
      if (!acc) {
        acc = {
          binEntry: bin.entry,
          binCode: bin.code,
          sequence: bin.sequence ?? NO_BIN_SEQUENCE,
          items: [],
        };
        byBin.set(key, acc);
      }
      acc.items.push(toStopItem(item, bin.quantity, bin.packages));
    }
  }

  const ordered = Array.from(byBin.values()).sort(compareStops);
  if (noBin) {
    ordered.push(noBin);
  }

  const stops: PickPathStop[] = ordered.map((acc, index) => ({
    position: index + 1,
    binEntry: acc.binEntry,
    binCode: acc.binCode,
    items: acc.items,
    totalQuantityToPick: acc.items.reduce((sum, i) => sum + i.quantityToPick, 0),
    isNext: index === 0,
  }));

  return {
    stops,
    totalStops: stops.length,
    totalQuantity,
    pickedQuantity,
  };
}
