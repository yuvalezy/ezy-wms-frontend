import {PickingDocumentDetailItem} from "@/features/picking/data/picking";
import {compareBinCodes} from "@/features/picking/utils/bin-code-sort";

/**
 * Pick-path routing (frontend, presentation only).
 *
 * We INVERT the item-first payload into a location-first walk: one "stop" per bin, listing the
 * items to grab at each bin. Stops are ordered by compareBinCodes (see bin-code-sort.ts) — by
 * default a natural, segment-aware comparison of the full bin CODE so the picker walks the
 * warehouse monotonically (floor/aisle A before B before C, bays/levels ascending) instead of
 * bouncing around; optionally overridden per-tenant by Options.PickPathSortKey (e.g. a customer
 * whose bins are named A1/B1/C1 and wants position to outrank aisle).
 *
 * The backend `sequence` is intentionally IGNORED here: it only reads the trailing digits of each
 * dash-segment, so codes whose aisle/floor is a LETTER (e.g. `01-A1-...` vs `01-C1-...`) collapse
 * to the same value and sort by the wrong segment. Sorting the full code directly is correct for
 * both the `BIN-P9/P10` convention and letter-based codes.
 */

export interface PickPathStopItem {
  itemCode: string;
  itemName: string;
  /** Quantity available to pick at THIS bin. */
  quantityToPick: number;
  /** Item-level totals, for context. */
  picked: number;
  openQuantity: number;
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

// Quantities are decimals; treat sub-unit residue as zero (mirrors backend QuantityTolerances.Completed).
const QUANTITY_EPSILON = 0.0001;

interface StopAccumulator {
  binEntry: number | null;
  binCode: string | null;
  items: PickPathStopItem[];
}

function toStopItem(item: PickingDocumentDetailItem, quantityToPick: number): PickPathStopItem {
  return {
    itemCode: item.itemCode,
    itemName: item.itemName,
    quantityToPick,
    picked: item.picked,
    openQuantity: item.openQuantity,
    numInBuy: item.numInBuy,
    buyUnitMsr: item.buyUnitMsr,
    purPackUn: item.purPackUn,
    purPackMsr: item.purPackMsr,
    item,
  };
}

/** Orders stops by the physical walk order of their bin code (see compareBinCodes). */
function compareStops(a: StopAccumulator, b: StopAccumulator, sortKey?: string | null): number {
  return compareBinCodes(a.binCode, b.binCode, sortKey);
}

/**
 * Build the ordered walk from the item-first detail. Demand-driven: each item's remaining open
 * quantity is allocated across its bins in walk order (nearest first), capping each stop's
 * quantity-to-pick and dropping bins once the demand is covered. Fully-picked items contribute no
 * stops; items still open with no bin info are collected into a trailing "no bin location" stop.
 *
 * sortKey is the optional Options.PickPathSortKey token expression (see bin-code-sort.ts);
 * omitted/invalid falls back to the default aisle-first natural compare.
 */
export function buildPickPath(items?: PickingDocumentDetailItem[], sortKey?: string | null): PickPath {
  const byBin = new Map<string, StopAccumulator>();
  let noBin: StopAccumulator | null = null;
  let totalQuantity = 0;
  let pickedQuantity = 0;

  for (const item of items ?? []) {
    totalQuantity += item.quantity ?? 0;
    pickedQuantity += item.picked ?? 0;

    // Demand-driven: only route as much as the item still needs. A fully-picked item
    // contributes no stops even if its bins still hold stock.
    let remaining = item.openQuantity ?? 0;
    if (remaining <= QUANTITY_EPSILON) {
      continue;
    }

    // Walk order: allocate from the nearest bin first so the bins we keep are the earliest stops.
    const bins = (item.binQuantities ?? [])
      .filter((b) => (b.quantity ?? 0) > 0)
      .sort((a, b) => compareBinCodes(a.code, b.code, sortKey));

    if (bins.length === 0) {
      // Still-open item with nowhere to route — surface it so it isn't silently dropped.
      noBin ??= {binEntry: null, binCode: null, items: []};
      noBin.items.push(toStopItem(item, remaining));
      continue;
    }

    for (const bin of bins) {
      if (remaining <= QUANTITY_EPSILON) {
        break; // demand covered — later bins are no longer relevant
      }
      const take = Math.min(bin.quantity ?? 0, remaining);
      if (take <= QUANTITY_EPSILON) {
        continue;
      }
      remaining -= take;

      const key = String(bin.entry);
      let acc = byBin.get(key);
      if (!acc) {
        acc = {
          binEntry: bin.entry,
          binCode: bin.code,
          items: [],
        };
        byBin.set(key, acc);
      }
      acc.items.push(toStopItem(item, take));
    }
  }

  const ordered = Array.from(byBin.values()).sort((a, b) => compareStops(a, b, sortKey));
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
