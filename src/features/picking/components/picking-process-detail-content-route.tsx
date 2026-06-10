import React, {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {ChevronRight, MapPin, Navigation} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {useStockInfo} from "@/utils/stock-info";
import ItemDetailsLink from "@/components/ItemDetailsLink";
import {PickingDocumentDetailItem} from "@/features/picking/data/picking";
import {buildPickPath, PickPathStop, PickPathStopItem} from "@/features/picking/utils/pick-path";

interface PickingProcessDetailContentRouteProps {
  items?: PickingDocumentDetailItem[];
  /** Bin the picker has currently scanned, if any — labels the focus stop as "here". */
  currentBinEntry?: number | null;
}

export const PickingProcessDetailContentRoute = ({items, currentBinEntry}: PickingProcessDetailContentRouteProps) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();
  const path = useMemo(() => buildPickPath(items), [items]);
  const [expanded, setExpanded] = useState<Set<number | string>>(new Set());

  const percent = path.totalQuantity > 0
    ? Math.round((path.pickedQuantity / path.totalQuantity) * 100)
    : 0;

  if (path.totalStops === 0) {
    // Nothing left to walk to — the parent already shows the completion alert.
    return null;
  }

  const fmt = (item: PickPathStopItem, quantity: number) => stockInfo({
    quantity,
    numInBuy: item.numInBuy,
    buyUnitMsr: item.buyUnitMsr,
    purPackUn: item.purPackUn,
    purPackMsr: item.purPackMsr,
  });

  // Short qty summary for a collapsed queue row: one item -> its formatted qty, otherwise a count.
  const stopSummary = (stop: PickPathStop) =>
    stop.items.length === 1
      ? fmt(stop.items[0], stop.items[0].quantityToPick)
      : t("itemsCount", {count: stop.items.length});

  const focus = path.stops[0];
  const queue = path.stops.slice(1);
  const focusIsHere = focus.binEntry != null && focus.binEntry === currentBinEntry;

  const toggle = (key: number | string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-primary"/>
            {t("pickRoute")}
          </span>
          <span className="text-muted-foreground text-xs">
            {t("stopsRemaining", {count: path.totalStops})} · {percent}%
          </span>
        </div>
        <Progress value={percent}/>
      </div>

      {/* Focus: the next stop, everything the picker needs right now. */}
      <Card className={`border-l-4 ${focusIsHere ? "border-l-blue-500 ring-1 ring-blue-200 dark:ring-blue-900" : "border-l-primary"}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className="inline-flex items-center gap-1.5 shrink-0">
              <Navigation className="h-3 w-3"/>
              {focusIsHere ? t("here") : t("nextStop")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t("stopXofY", {current: focus.position, total: path.totalStops})}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0 text-muted-foreground"/>
            <span className="text-lg font-bold truncate">{focus.binCode ?? t("noBinLocation")}</span>
          </div>
          <div className="space-y-3">
            {focus.items.map((row) => (
              <StopItemRow key={`focus-${row.itemCode}`} row={row} fmt={fmt} prominent/>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue: the rest of the walk, one tappable line each. */}
      {queue.length > 0 && (
        <div>
          <div className="px-1 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("upNext")}
          </div>
          <Card>
            <CardContent className="p-0 divide-y">
              {queue.map((stop) => {
                const key = stop.binEntry ?? `no-bin-${stop.position}`;
                const isOpen = expanded.has(key);
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
                    >
                      <Badge variant="secondary" className="shrink-0">{stop.position}</Badge>
                      <span className="font-medium truncate">{stop.binCode ?? t("noBinLocation")}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground">{stopSummary(stop)}</span>
                      <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}/>
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 space-y-2 bg-muted/30">
                        {stop.items.map((row) => (
                          <StopItemRow key={`${key}-${row.itemCode}`} row={row} fmt={fmt}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface StopItemRowProps {
  row: PickPathStopItem;
  fmt: (item: PickPathStopItem, quantity: number) => React.ReactNode;
  prominent?: boolean;
}

const StopItemRow = ({row, fmt, prominent}: StopItemRowProps) => {
  const {t} = useTranslation();
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-2 text-sm">
        <ItemDetailsLink data={row.item}/>
        <span className="text-muted-foreground truncate">{row.itemName}</span>
      </div>
      <div className="flex items-baseline gap-x-3 gap-y-0.5 flex-wrap">
        <span className={prominent ? "text-base font-semibold" : "text-sm font-medium"}>
          {t("quantityToPick")} {fmt(row, row.quantityToPick)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("pending")} {fmt(row, row.openQuantity)}
        </span>
        {row.picked > 0 && (
          <span className="text-xs text-muted-foreground">
            {t("picked")} {fmt(row, row.picked)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PickingProcessDetailContentRoute;
