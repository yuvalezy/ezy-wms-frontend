import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Card, CardContent} from "@/components/ui/card";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertTriangle, GripVertical, Pencil, Plus, Save, Trash2} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import SectionHistoryDialog from "./SectionHistoryDialog";
import EditorActionBar from "./EditorActionBar";

interface Props {
  onSaved: () => void;
}

/** A working copy of a single metadata definition. `_id` is a client-only key. */
interface MetadataItem {
  _id: string;
  Id?: string;
  Description?: string;
  Type?: string;
  Query?: string;
  GroupBy?: string;
  Step?: string;
  Required?: string;
  ReadOnly?: string;
  MirrorTo?: string;
  ScaleByField?: string;
  /** Advanced keys (e.g. Calculated) we preserve untouched. */
  [k: string]: any;
}

const SECTION = "Item";

/** MetadataFieldType enum members (Core/Models/Settings/MetadataDefinition.cs). */
const FIELD_TYPES = ["String", "Decimal", "Date", "Integer"];
const DEFAULT_TYPE = "String";

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

/** Config leaf booleans are stored as the strings "true"/"false". */
const isTrue = (v: unknown) => v === "true" || v === true;

const SortableRow: React.FC<{ item: MetadataItem; onEdit: () => void; onRemove: () => void }> =
  ({item, onEdit, onRemove}) => {
    const {t} = useTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: item._id});
    const style = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1};

    return (
      <div ref={setNodeRef} style={style}
           className="flex items-center gap-2 rounded-md border bg-card px-2 py-2">
        <button type="button" className="cursor-grab text-muted-foreground" {...attributes} {...listeners}
                aria-label={t("configuration.dragToReorder")}>
          <GripVertical className="h-4 w-4"/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{item.Id || "—"}</div>
          <div className="text-xs text-muted-foreground truncate">{item.Description}</div>
        </div>
        {isTrue(item.ReadOnly) && (
          <Badge variant="secondary">{t("configuration.item.readOnly")}</Badge>
        )}
        {isTrue(item.Required) && (
          <Badge variant="secondary">{t("configuration.item.required")}</Badge>
        )}
        {item.Calculated && <Badge variant="outline">{t("configuration.item.calculated")}</Badge>}
        {item.Type && <Badge variant="outline">{item.Type}</Badge>}
        <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4"/></Button>
        <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive"/></Button>
      </div>
    );
  };

const ItemMetadataEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [version, setVersion] = useState<number | undefined>();
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<MetadataItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MetadataItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setErrors([]);
      const d = await configurationService.get(SECTION);
      setVersion(d.version);
      const raw = d.json ?? {};
      const arr = Array.isArray(raw.MetadataDefinition) ? raw.MetadataDefinition : [];
      setItems(arr.map((f: any) => ({_id: nextId(), ...f})));
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const {active, over} = e;
    if (!over || active.id === over.id) {
      return;
    }
    setItems((prev) => {
      const oldIndex = prev.findIndex((f) => f._id === active.id);
      const newIndex = prev.findIndex((f) => f._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const upsertItem = (item: MetadataItem) => {
    setItems((prev) => {
      const list = [...prev];
      const idx = list.findIndex((f) => f._id === item._id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.push(item);
      }
      return list;
    });
    setEditing(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((f) => f._id !== id));
  };

  /** All defined metadata IDs — used to validate Calculated formula/dependency references. */
  const knownIds = useMemo(
    () => new Set(items.map((i) => (i.Id ?? "").trim()).filter(Boolean)),
    [items],
  );

  const save = async () => {
    setErrors([]);
    try {
      setSaving(true);
      // Drop the client-only `_id`, keep every other key (incl. advanced Calculated).
      const definitions = items.map(({_id, ...rest}) => rest);
      await configurationService.update(SECTION, {MetadataDefinition: definitions}, version);
      toast.success(t("configuration.saved"));
      onSaved();
      await load();
    } catch (error: any) {
      const data = error?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [data?.error_description ?? `${error}`]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{t("configuration.dragHint")}</span>
        <Button size="sm" variant="outline" onClick={() => setEditing({_id: nextId(), Type: DEFAULT_TYPE})}>
          <Plus className="h-4 w-4 mr-1"/>{t("add")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 max-h-[55vh] overflow-auto py-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((f) => f._id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRow key={item._id} item={item}
                             onEdit={() => setEditing(item)}
                             onRemove={() => setPendingDelete(item)}/>
              ))}
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("configuration.item.noFields")}</p>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            <ul className="list-disc pl-4">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </AlertDescription>
        </Alert>
      )}

      <EditorActionBar onShowHistory={() => setShowHistory(true)}>
        <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1"/>{t("save")}</Button>
      </EditorActionBar>

      {editing && (
        <MetadataDialog item={editing} knownIds={knownIds} onCancel={() => setEditing(null)} onSave={upsertItem}/>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("configuration.item.deleteFieldConfirm", {id: pendingDelete?.Id || "—"})}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  removeItem(pendingDelete._id);
                }
                setPendingDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

const MetadataDialog: React.FC<{
  item: MetadataItem;
  knownIds: Set<string>;
  onCancel: () => void;
  onSave: (f: MetadataItem) => void;
}> =
  ({item, knownIds, onCancel, onSave}) => {
    const {t} = useTranslation();
    const [draft, setDraft] = useState<MetadataItem>({...item});
    const set = (k: string, v: string) => setDraft((d) => ({...d, [k]: v}));
    /** Switching ReadOnly/Required on clears the other — they are mutually exclusive. */
    const setBool = (k: "ReadOnly" | "Required", on: boolean) =>
      setDraft((d) => {
        const next = {...d, [k]: on ? "true" : "false"};
        if (on) {
          next[k === "ReadOnly" ? "Required" : "ReadOnly"] = "false";
        }
        return next;
      });

    // Calculated (computed field) — a nested object; string-valued leaves, array Dependencies.
    const calc = draft.Calculated as Record<string, any> | undefined;
    const calcEnabled = !!calc;
    const toggleCalc = (on: boolean) =>
      setDraft((d) => {
        const next = {...d};
        if (on) {
          next.Calculated = d.Calculated ?? {Formula: "", Dependencies: [], Precision: "0", ClearDependenciesOnManualEdit: "false"};
        } else {
          delete next.Calculated;
        }
        return next;
      });
    const setCalc = (k: string, v: any) =>
      setDraft((d) => ({...d, Calculated: {...(d.Calculated ?? {}), [k]: v}}));

    // Validate the calculation: {tokens} in the Formula and the Dependencies must
    // reference OTHER defined metadata field IDs.
    const otherIds = new Set([...knownIds].filter((id) => id !== (draft.Id ?? "").trim()));
    const formula = (calc?.Formula ?? "") as string;
    const formulaRefs = (formula.match(/\{([^}]+)\}/g) ?? []).map((x) => x.slice(1, -1).trim());
    const badFormulaRefs = [...new Set(formulaRefs.filter((r) => !otherIds.has(r)))];
    const deps: string[] = calc?.Dependencies ?? [];
    const badDeps = deps.filter((d) => !otherIds.has(d));
    const calcInvalid = calcEnabled && (!formula.trim() || badFormulaRefs.length > 0 || badDeps.length > 0);

    return (
      <Dialog open onOpenChange={(o) => !o && onCancel()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{t("configuration.item.field")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("configuration.item.id")} *</Label>
              <Input value={draft.Id ?? ""} onChange={(e) => set("Id", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.description")} *</Label>
              <Input value={draft.Description ?? ""} onChange={(e) => set("Description", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.type")}</Label>
              <Select value={draft.Type ?? DEFAULT_TYPE} onValueChange={(v) => set("Type", v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => <SelectItem key={ft} value={ft}>{ft}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label className="cursor-pointer">{t("configuration.item.readOnly")}</Label>
              <Switch checked={draft.ReadOnly === "true"} onCheckedChange={(v) => setBool("ReadOnly", v)}/>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label className="cursor-pointer">{t("configuration.item.required")}</Label>
              <Switch checked={draft.Required === "true"} onCheckedChange={(v) => setBool("Required", v)}/>
            </div>
            <div>
              <Label>{t("configuration.query")} (SQL)</Label>
              <Input className="font-mono text-xs" value={draft.Query ?? ""}
                     onChange={(e) => set("Query", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.groupBy")} (SQL)</Label>
              <Input className="font-mono text-xs" value={draft.GroupBy ?? ""}
                     onChange={(e) => set("GroupBy", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.item.step")}</Label>
              <Input type="number" value={draft.Step ?? ""} onChange={(e) => set("Step", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.item.mirrorTo")}</Label>
              <Input value={draft.MirrorTo ?? ""} onChange={(e) => set("MirrorTo", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.item.scaleByField")}</Label>
              <Input className="font-mono text-xs" placeholder="e.g. PurPackUn"
                     value={draft.ScaleByField ?? ""} onChange={(e) => set("ScaleByField", e.target.value)}/>
              <p className="text-xs text-muted-foreground mt-1">{t("configuration.item.scaleByFieldHint")}</p>
            </div>

            <div className="rounded-md border px-3 py-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">{t("configuration.item.calculated")}</Label>
                <Switch checked={calcEnabled} onCheckedChange={toggleCalc}/>
              </div>
              {calcEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label>{t("configuration.item.formula")} *</Label>
                    <Input className="font-mono text-xs" placeholder="{FieldA} * {FieldB}"
                           value={calc?.Formula ?? ""} onChange={(e) => setCalc("Formula", e.target.value)}/>
                    {badFormulaRefs.length > 0 && (
                      <p className="text-xs text-destructive">
                        {t("configuration.item.unknownFields", {fields: badFormulaRefs.join(", ")})}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>{t("configuration.item.dependencies")}</Label>
                    <Input
                      value={(calc?.Dependencies ?? []).join(", ")}
                      onChange={(e) => setCalc("Dependencies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                    {badDeps.length > 0 ? (
                      <p className="text-xs text-destructive">
                        {t("configuration.item.unknownFields", {fields: badDeps.join(", ")})}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t("configuration.item.dependenciesHint")}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <Label>{t("configuration.item.precision")}</Label>
                      <Input type="number" value={calc?.Precision ?? ""}
                             onChange={(e) => setCalc("Precision", e.target.value)}/>
                    </div>
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <Label className="cursor-pointer text-xs">{t("configuration.item.clearDeps")}</Label>
                      <Switch checked={calc?.ClearDependenciesOnManualEdit === "true"}
                              onCheckedChange={(v) => setCalc("ClearDependenciesOnManualEdit", v ? "true" : "false")}/>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
            <Button disabled={!draft.Id || !draft.Description || calcInvalid}
                    onClick={() => onSave(draft)}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export default ItemMetadataEditor;
