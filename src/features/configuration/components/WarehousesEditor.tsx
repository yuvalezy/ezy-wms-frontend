import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Combobox, ComboboxItem} from "@/components/ui/combobox";
import {Save} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {BinOption, WarehouseOption, warehouseConfigService} from "../data/warehouse-config-service";
import SectionHistoryDialog from "./SectionHistoryDialog";
import EditorActionBar from "./EditorActionBar";

interface Props {
  onSaved: () => void;
}

/** Per-warehouse settings as stored in the config JSON (string-valued, PascalCase keys). */
interface WarehouseEntry {
  InitialCountingBinEntry?: string;
  CancelPickingBinEntry?: string;
  StagingBinEntry?: string;
}

const SECTION = "Warehouses";

/** Keep only meaningful (non-empty) leaves; returns undefined when nothing is set. */
const cleanEntry = (entry: WarehouseEntry): WarehouseEntry | undefined => {
  const out: WarehouseEntry = {};
  (Object.keys(entry) as (keyof WarehouseEntry)[]).forEach((k) => {
    const v = entry[k];
    if (v !== undefined && v !== null && `${v}`.trim() !== "") {
      out[k] = `${v}`;
    }
  });
  return Object.keys(out).length ? out : undefined;
};

const WarehousesEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [version, setVersion] = useState<number | undefined>();
  const [overrides, setOverrides] = useState<Record<string, WarehouseEntry>>({});
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [bins, setBins] = useState<BinOption[]>([]);
  const [binsLoading, setBinsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      const [detail, whs] = await Promise.all([
        configurationService.get(SECTION),
        warehouseConfigService.getWarehouses(),
      ]);
      setVersion(detail.version);
      const raw = (detail.json ?? {}) as Record<string, WarehouseEntry>;
      const next: Record<string, WarehouseEntry> = {};
      Object.keys(raw).forEach((code) => {
        next[code] = {...raw[code]};
      });
      setOverrides(next);
      setWarehouses(whs);
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    }
  };

  // Load the selected warehouse's bins.
  useEffect(() => {
    if (!selected) {
      setBins([]);
      return;
    }
    // Non-bin-managed warehouses have no bins to load.
    const wh = warehouses.find((w) => w.id === selected);
    if (wh && !wh.enableBinLocations) {
      setBins([]);
      return;
    }
    let cancelled = false;
    setBinsLoading(true);
    warehouseConfigService
      .getBins(selected)
      .then((data) => {
        if (!cancelled) {
          setBins(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(`${t("configuration.warehouses.binsLoadFailed")}: ${error}`);
          setBins([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBinsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const warehouseItems: ComboboxItem[] = useMemo(
    () =>
      warehouses.map((w) => ({
        value: w.id,
        label: w.id === w.name ? w.id : `${w.id} — ${w.name}`,
      })),
    [warehouses],
  );

  const binItems: ComboboxItem[] = useMemo(
    () => bins.map((b) => ({value: `${b.entry}`, label: b.code})),
    [bins],
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selected),
    [warehouses, selected],
  );
  const isBinManaged = selectedWarehouse?.enableBinLocations ?? false;
  const nonBinSelected = !!selected && !isBinManaged;

  const entry = selected ? overrides[selected] ?? {} : {};

  // Resolve a stored bin entry id to a human-readable code (from the loaded bins, else show the raw id).
  const binCodeFor = (value?: string): string | undefined => {
    if (!value) {
      return undefined;
    }
    const match = bins.find((b) => `${b.entry}` === `${value}`);
    return match ? match.code : `#${value}`;
  };

  const setField = (field: keyof WarehouseEntry, value: string) => {
    if (!selected) {
      return;
    }
    setOverrides((prev) => {
      const current = {...(prev[selected] ?? {})};
      if (value === "") {
        delete current[field];
      } else {
        current[field] = value;
      }
      return {...prev, [selected]: current};
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      // Rebuild the whole sparse dict: preserve every warehouse, drop the empties.
      const json: Record<string, WarehouseEntry> = {};
      Object.entries(overrides).forEach(([code, e]) => {
        const cleaned = cleanEntry(e);
        if (cleaned) {
          json[code] = cleaned;
        }
      });
      await configurationService.update(SECTION, json, version);
      toast.success(t("configuration.saved"));
      onSaved();
      await load();
    } catch (error: any) {
      const data = error?.response?.data;
      toast.error(data?.errors?.[0] ?? data?.error_description ?? `${error}`);
    } finally {
      setSaving(false);
    }
  };

  const cancelStored = binCodeFor(entry.CancelPickingBinEntry);
  const countingStored = binCodeFor(entry.InitialCountingBinEntry);
  const stagingStored = binCodeFor(entry.StagingBinEntry);

  const binPlaceholder = binsLoading
    ? t("loading")
    : binItems.length === 0
      ? t("configuration.warehouses.noBins")
      : t("configuration.warehouses.selectBin");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("configuration.warehouses.hint")}</p>

      <Card>
        <CardContent className="space-y-4 py-4">
          <div className="space-y-1">
            <Label>{t("configuration.warehouses.warehouse")}</Label>
            <Combobox
              items={warehouseItems}
              value={selected}
              onChange={setSelected}
              placeholder={t("configuration.warehouses.selectWarehouse")}
              searchPlaceholder={t("configuration.warehouses.searchWarehouse")}
              emptyText={t("configuration.warehouses.noWarehouses")}
            />
          </div>

          {selected && isBinManaged && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* CancelPickingBinEntry — REQUIRED */}
              <div className="space-y-1">
                <Label className="gap-1">
                  {t("configuration.warehouses.fields.CancelPickingBinEntry")}
                  <span className="text-destructive">*</span>
                </Label>
                <Combobox
                  items={binItems}
                  value={entry.CancelPickingBinEntry ?? ""}
                  onChange={(v) => setField("CancelPickingBinEntry", v)}
                  placeholder={binPlaceholder}
                  searchPlaceholder={t("configuration.warehouses.searchBin")}
                  emptyText={t("configuration.warehouses.noBins")}
                  disabled={binsLoading || binItems.length === 0}
                />
                <p className="text-xs text-destructive">{t("configuration.warehouses.required")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("configuration.warehouses.stored")}:{" "}
                  {cancelStored ? <Badge variant="outline">{cancelStored}</Badge> : t("configuration.warehouses.none")}
                </p>
              </div>

              {/* InitialCountingBinEntry — OPTIONAL */}
              <div className="space-y-1">
                <Label className="gap-1">
                  {t("configuration.warehouses.fields.InitialCountingBinEntry")}
                  <span className="text-muted-foreground text-xs font-normal">
                    ({t("configuration.warehouses.optional")})
                  </span>
                </Label>
                <Combobox
                  items={binItems}
                  value={entry.InitialCountingBinEntry ?? ""}
                  onChange={(v) => setField("InitialCountingBinEntry", v)}
                  placeholder={binPlaceholder}
                  searchPlaceholder={t("configuration.warehouses.searchBin")}
                  emptyText={t("configuration.warehouses.noBins")}
                  allowClear
                  clearLabel={t("configuration.warehouses.none")}
                  disabled={binsLoading || binItems.length === 0}
                />
                <p className="text-xs text-muted-foreground">
                  {t("configuration.warehouses.stored")}:{" "}
                  {countingStored ? <Badge variant="outline">{countingStored}</Badge> : t("configuration.warehouses.none")}
                </p>
              </div>

              {/* StagingBinEntry — OPTIONAL */}
              <div className="space-y-1">
                <Label className="gap-1">
                  {t("configuration.warehouses.fields.StagingBinEntry")}
                  <span className="text-muted-foreground text-xs font-normal">
                    ({t("configuration.warehouses.optional")})
                  </span>
                </Label>
                <Combobox
                  items={binItems}
                  value={entry.StagingBinEntry ?? ""}
                  onChange={(v) => setField("StagingBinEntry", v)}
                  placeholder={binPlaceholder}
                  searchPlaceholder={t("configuration.warehouses.searchBin")}
                  emptyText={t("configuration.warehouses.noBins")}
                  allowClear
                  clearLabel={t("configuration.warehouses.none")}
                  disabled={binsLoading || binItems.length === 0}
                />
                <p className="text-xs text-muted-foreground">
                  {t("configuration.warehouses.stored")}:{" "}
                  {stagingStored ? <Badge variant="outline">{stagingStored}</Badge> : t("configuration.warehouses.none")}
                </p>
              </div>
            </div>
          )}

          {nonBinSelected && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("configuration.warehouses.notBinManaged")}
            </p>
          )}

          {!selected && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("configuration.warehouses.pickToEdit")}
            </p>
          )}
        </CardContent>
      </Card>

      <EditorActionBar onShowHistory={() => setShowHistory(true)}>
        <Button onClick={save} disabled={saving || nonBinSelected}>
          <Save className="h-4 w-4 mr-1" />{t("save")}
        </Button>
      </EditorActionBar>

      <SectionHistoryDialog
        section={SECTION}
        open={showHistory}
        onOpenChange={setShowHistory}
        onRestored={() => {
          onSaved();
          void load();
        }}
      />
    </div>
  );
};

export default WarehousesEditor;
