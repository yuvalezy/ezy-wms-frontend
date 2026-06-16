import React, {useEffect, useState} from "react";
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
import {AlertTriangle, GripVertical, History, Pencil, Plus, RotateCw, Save, ShieldAlert, Trash2} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import SectionHistoryDialog from "./SectionHistoryDialog";

interface Props {
  onSaved: () => void;
}

const SECTION = "PickingPostProcessingProcessors";

/** Config leaf booleans are stored as the strings "true"/"false". */
const isTrue = (v: unknown) => v === "true" || v === true;
const boolStr = (on: boolean) => (on ? "true" : "false");

/** A working copy of a single processor. `_id` is a client-only key. */
interface ProcessorItem {
  _id: string;
  Id?: string;
  Assembly?: string;
  TypeName?: string;
  Enabled?: any;
  /** Arbitrary string key/value pairs. */
  Configuration?: Record<string, any>;
  /** Pass-through keys (any unknowns) preserved untouched. */
  [k: string]: any;
}

let idCounter = 0;
const nextId = () => `p${++idCounter}`;

const SortableRow: React.FC<{ item: ProcessorItem; onEdit: () => void; onRemove: () => void }> =
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
          <div className="text-xs text-muted-foreground truncate">{item.TypeName}</div>
        </div>
        <Badge variant={isTrue(item.Enabled) ? "default" : "secondary"}>
          {isTrue(item.Enabled)
            ? t("configuration.pickingPostProcessors.enabled")
            : t("configuration.pickingPostProcessors.disabled")}
        </Badge>
        <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4"/></Button>
        <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive"/></Button>
      </div>
    );
  };

const PickingPostProcessorsEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [version, setVersion] = useState<number | undefined>();
  const [items, setItems] = useState<ProcessorItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ProcessorItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProcessorItem | null>(null);
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
      // This section's document is a TOP-LEVEL ARRAY of processors.
      const arr = Array.isArray(d.json) ? d.json : [];
      setItems(arr.map((p: any) => ({_id: nextId(), ...p})));
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
      const oldIndex = prev.findIndex((p) => p._id === active.id);
      const newIndex = prev.findIndex((p) => p._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const upsertItem = (item: ProcessorItem) => {
    setItems((prev) => {
      const list = [...prev];
      const idx = list.findIndex((p) => p._id === item._id);
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
    setItems((prev) => prev.filter((p) => p._id !== id));
  };

  const save = async () => {
    setErrors([]);
    try {
      setSaving(true);
      // Drop the client-only `_id`, keep every other key (incl. unknown pass-through).
      // The document is a top-level ARRAY — send the array, not an object.
      const processors = items.map(({_id, ...rest}) => rest);
      await configurationService.update(SECTION, processors, version);
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
      <Alert>
        <ShieldAlert className="h-4 w-4"/>
        <AlertDescription>{t("configuration.restrictedWarning")}</AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <RotateCw className="h-3 w-3"/>{t("configuration.appliesAfterRestart")}
          </Badge>
          <span>{t("configuration.dragHint")}</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing(newProcessor())}>
          <Plus className="h-4 w-4 mr-1"/>{t("add")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 max-h-[55vh] overflow-auto py-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((p) => p._id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRow key={item._id} item={item}
                             onEdit={() => setEditing(item)}
                             onRemove={() => setPendingDelete(item)}/>
              ))}
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("configuration.pickingPostProcessors.noProcessors")}
            </p>
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

      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="ghost" onClick={() => setShowHistory(true)}>
          <History className="h-4 w-4 mr-1"/>{t("configuration.history")}
        </Button>
        <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1"/>{t("save")}</Button>
      </div>

      {editing && (
        <ProcessorDialog processor={editing} onCancel={() => setEditing(null)} onSave={upsertItem}/>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("configuration.pickingPostProcessors.deleteProcessorConfirm", {id: pendingDelete?.Id || "—"})}
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

/** A fresh processor seeded with the same defaults as the POCO. */
const newProcessor = (): ProcessorItem => ({
  _id: nextId(),
  Id: "",
  Assembly: "",
  TypeName: "",
  Enabled: "true",
  Configuration: {},
});

/** One editable Configuration key/value pair. `key` is empty for a fresh row. */
interface ConfigPair {
  key: string;
  value: string;
}

const ProcessorDialog: React.FC<{
  processor: ProcessorItem;
  onCancel: () => void;
  onSave: (p: ProcessorItem) => void;
}> =
  ({processor, onCancel, onSave}) => {
    const {t} = useTranslation();
    const [draft, setDraft] = useState<ProcessorItem>({...processor});
    // Configuration is edited as an ordered list of pairs, then rebuilt into an object on save.
    const [pairs, setPairs] = useState<ConfigPair[]>(() =>
      Object.entries(processor.Configuration ?? {}).map(([key, value]) => ({key, value: String(value ?? "")})),
    );
    const set = (k: string, v: any) => setDraft((d) => ({...d, [k]: v}));

    const setPair = (idx: number, field: keyof ConfigPair, v: string) =>
      setPairs((prev) => prev.map((p, i) => (i === idx ? {...p, [field]: v} : p)));
    const addPair = () => setPairs((prev) => [...prev, {key: "", value: ""}]);
    const removePair = (idx: number) => setPairs((prev) => prev.filter((_, i) => i !== idx));

    const valid = !!(draft.Id?.trim() && draft.Assembly?.trim() && draft.TypeName?.trim());

    const submit = () => {
      // Rebuild Configuration as an object; drop pairs with an empty key, last write wins.
      const configuration: Record<string, string> = {};
      pairs.forEach(({key, value}) => {
        const k = key.trim();
        if (k) {
          configuration[k] = value;
        }
      });
      onSave({...draft, Configuration: configuration});
    };

    return (
      <Dialog open onOpenChange={(o) => !o && onCancel()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{t("configuration.pickingPostProcessors.processor")}</DialogTitle></DialogHeader>

          <Alert>
            <ShieldAlert className="h-4 w-4"/>
            <AlertDescription>{t("configuration.restrictedWarning")}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <Label>{t("configuration.pickingPostProcessors.id")} *</Label>
              <Input value={draft.Id ?? ""} onChange={(e) => set("Id", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.pickingPostProcessors.assembly")} *</Label>
              <Input className="font-mono text-xs" value={draft.Assembly ?? ""}
                     onChange={(e) => set("Assembly", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.pickingPostProcessors.typeName")} *</Label>
              <Input className="font-mono text-xs" value={draft.TypeName ?? ""}
                     onChange={(e) => set("TypeName", e.target.value)}/>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label className="cursor-pointer">{t("configuration.pickingPostProcessors.enabled")}</Label>
              <Switch checked={isTrue(draft.Enabled)} onCheckedChange={(v) => set("Enabled", boolStr(v))}/>
            </div>

            <div className="rounded-md border px-3 py-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("configuration.pickingPostProcessors.configuration")}</Label>
                <Button size="sm" variant="outline" onClick={addPair}>
                  <Plus className="h-4 w-4 mr-1"/>{t("add")}
                </Button>
              </div>
              {pairs.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("configuration.pickingPostProcessors.noConfiguration")}
                </p>
              )}
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input className="flex-1" placeholder={t("configuration.pickingPostProcessors.configKey")}
                         value={pair.key} onChange={(e) => setPair(idx, "key", e.target.value)}/>
                  <Input className="flex-1" placeholder={t("configuration.pickingPostProcessors.configValue")}
                         value={pair.value} onChange={(e) => setPair(idx, "value", e.target.value)}/>
                  <Button size="sm" variant="ghost" onClick={() => removePair(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
            <Button disabled={!valid} onClick={submit}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export default PickingPostProcessorsEditor;
