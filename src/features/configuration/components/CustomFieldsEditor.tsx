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
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {GripVertical, Pencil, Plus, Save, Trash2} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import SectionHistoryDialog from "./SectionHistoryDialog";
import EditorActionBar from "./EditorActionBar";

interface Props {
  onSaved: () => void;
}

interface FieldItem {
  _id: string;
  Key?: string;
  Description?: string;
  Type?: string;
  Query?: string;
  GroupBy?: string;
  [k: string]: any;
}

const SECTION = "CustomFields";

let idCounter = 0;
const nextId = () => `f${++idCounter}`;

const SortableRow: React.FC<{ field: FieldItem; onEdit: () => void; onRemove: () => void }> =
  ({field, onEdit, onRemove}) => {
    const {t} = useTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: field._id});
    const style = {transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1};

    return (
      <div ref={setNodeRef} style={style}
           className="flex items-center gap-2 rounded-md border bg-card px-2 py-2">
        <button type="button" className="cursor-grab text-muted-foreground" {...attributes} {...listeners}
                aria-label={t("configuration.dragToReorder")}>
          <GripVertical className="h-4 w-4"/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{field.Key || "—"}</div>
          <div className="text-xs text-muted-foreground truncate">{field.Description}</div>
        </div>
        {field.Type && <Badge variant="outline">{field.Type}</Badge>}
        <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4"/></Button>
        <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive"/></Button>
      </div>
    );
  };

const CustomFieldsEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [version, setVersion] = useState<number | undefined>();
  const [collections, setCollections] = useState<Record<string, FieldItem[]>>({});
  const [active, setActive] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<FieldItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FieldItem | null>(null);
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
      const d = await configurationService.get(SECTION);
      setVersion(d.version);
      const cols: Record<string, FieldItem[]> = {};
      const raw = d.json ?? {};
      Object.keys(raw).forEach((key) => {
        const arr = Array.isArray(raw[key]) ? raw[key] : [];
        cols[key] = arr.map((f: any) => ({_id: nextId(), ...f}));
      });
      setCollections(cols);
      setActive(Object.keys(cols)[0] ?? "");
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    }
  };

  const collectionNames = useMemo(() => Object.keys(collections), [collections]);
  const items = collections[active] ?? [];

  const onDragEnd = (e: DragEndEvent) => {
    const {active: a, over} = e;
    if (!over || a.id === over.id) {
      return;
    }
    setCollections((prev) => {
      const list = prev[active];
      const oldIndex = list.findIndex((f) => f._id === a.id);
      const newIndex = list.findIndex((f) => f._id === over.id);
      return {...prev, [active]: arrayMove(list, oldIndex, newIndex)};
    });
  };

  const upsertField = (field: FieldItem) => {
    setCollections((prev) => {
      const list = [...(prev[active] ?? [])];
      const idx = list.findIndex((f) => f._id === field._id);
      if (idx >= 0) {
        list[idx] = field;
      } else {
        list.push(field);
      }
      return {...prev, [active]: list};
    });
    setEditing(null);
  };

  const removeField = (id: string) => {
    setCollections((prev) => ({...prev, [active]: prev[active].filter((f) => f._id !== id)}));
  };

  const save = async () => {
    try {
      setSaving(true);
      const json: Record<string, any[]> = {};
      Object.entries(collections).forEach(([name, list]) => {
        json[name] = list.map(({_id, ...rest}) => rest);
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

  return (
    <div className="space-y-4">
      {collectionNames.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {collectionNames.map((name) => (
            <Button key={name} size="sm" variant={name === active ? "default" : "outline"}
                    onClick={() => setActive(name)}>{name}</Button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{t("configuration.dragHint")}</span>
        <Button size="sm" variant="outline" onClick={() => setEditing({_id: nextId(), Type: "Text"})}>
          <Plus className="h-4 w-4 mr-1"/>{t("add")}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 max-h-[55vh] overflow-auto py-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((f) => f._id)} strategy={verticalListSortingStrategy}>
              {items.map((field) => (
                <SortableRow key={field._id} field={field}
                             onEdit={() => setEditing(field)}
                             onRemove={() => setPendingDelete(field)}/>
              ))}
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">{t("configuration.noFields")}</p>
          )}
        </CardContent>
      </Card>

      <EditorActionBar onShowHistory={() => setShowHistory(true)}>
        <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1"/>{t("save")}</Button>
      </EditorActionBar>

      {editing && (
        <FieldDialog field={editing} onCancel={() => setEditing(null)} onSave={upsertField}/>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("configuration.deleteFieldConfirm", {key: pendingDelete?.Key || "—"})}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  removeField(pendingDelete._id);
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

const FieldDialog: React.FC<{ field: FieldItem; onCancel: () => void; onSave: (f: FieldItem) => void }> =
  ({field, onCancel, onSave}) => {
    const {t} = useTranslation();
    const [draft, setDraft] = useState<FieldItem>({...field});
    const set = (k: string, v: string) => setDraft((d) => ({...d, [k]: v}));

    return (
      <Dialog open onOpenChange={(o) => !o && onCancel()}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("configuration.field")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("configuration.key")} *</Label>
              <Input value={draft.Key ?? ""} onChange={(e) => set("Key", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.description")}</Label>
              <Input value={draft.Description ?? ""} onChange={(e) => set("Description", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.type")}</Label>
              <Select value={draft.Type ?? "Text"} onValueChange={(v) => set("Type", v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Number">Number</SelectItem>
                  <SelectItem value="Date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("configuration.query")} (SQL)</Label>
              <Input className="font-mono text-xs" value={draft.Query ?? ""} onChange={(e) => set("Query", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.groupBy")} (SQL)</Label>
              <Input className="font-mono text-xs" value={draft.GroupBy ?? ""} onChange={(e) => set("GroupBy", e.target.value)}/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
            <Button disabled={!draft.Key} onClick={() => onSave(draft)}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export default CustomFieldsEditor;
