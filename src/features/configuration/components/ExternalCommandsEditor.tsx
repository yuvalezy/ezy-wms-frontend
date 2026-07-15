import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
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
import {Textarea} from "@/components/ui/textarea";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertTriangle, Pencil, Plus, Save, Trash2} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import SectionHistoryDialog from "./SectionHistoryDialog";
import EditorActionBar from "./EditorActionBar";

interface Props {
  onSaved: () => void;
}

const SECTION = "ExternalCommands";

/** Config leaf booleans are stored as the strings "true"/"false". */
const isTrue = (v: unknown) => v === "true" || v === true;
const boolStr = (on: boolean) => (on ? "true" : "false");

/** Enum members are stored as their member-name strings (see Core/Enums). */
const OBJECT_TYPES = ["GoodsReceipt", "InventoryCounting", "Transfer", "Picking", "PickingClosure"];
const TRIGGER_TYPES = ["Manual"];
const FILE_FORMATS = ["XML", "JSON"];
const RESULT_TYPES = ["Single", "Multiple"];
const DESTINATION_TYPES = ["LocalPath", "NetworkPath", "FTP", "SFTP"];

let idCounter = 0;
const nextId = () => `c${++idCounter}`;

/** A working copy of a single command. `_id` is a client-only key. */
interface CommandItem {
  _id: string;
  Id?: string;
  Name?: string;
  Description?: string;
  ObjectType?: string;
  TriggerType?: string;
  Enabled?: any;
  AllowBatchExecution?: any;
  Queries?: any[];
  FileFormat?: string;
  FileNamePattern?: string;
  Destination?: Record<string, any>;
  /** Pass-through keys (e.g. UIConfiguration and any unknowns) preserved untouched. */
  [k: string]: any;
}

const ExternalCommandsEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [version, setVersion] = useState<number | undefined>();
  /** Every top-level key from the loaded document, so unknowns survive a round-trip. */
  const [root, setRoot] = useState<Record<string, any>>({});
  const [global, setGlobal] = useState<Record<string, any>>({});
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CommandItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CommandItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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
      setRoot({...raw});
      setGlobal({...(raw.GlobalSettings ?? {})});
      const arr = Array.isArray(raw.Commands) ? raw.Commands : [];
      setCommands(arr.map((c: any) => ({_id: nextId(), ...c})));
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    }
  };

  /** Shallow merge into the GlobalSettings working copy, preserving sibling keys. */
  const setGlobalField = (key: string, value: any) =>
    setGlobal((prev) => ({...prev, [key]: value}));

  /** Merge into a nested GlobalSettings object (RetryPolicy / XmlSettings / JsonSettings). */
  const setGlobalNested = (group: string, key: string, value: any) =>
    setGlobal((prev) => ({...prev, [group]: {...(prev[group] ?? {}), [key]: value}}));

  const upsertCommand = (cmd: CommandItem) => {
    setCommands((prev) => {
      const list = [...prev];
      const idx = list.findIndex((c) => c._id === cmd._id);
      if (idx >= 0) {
        list[idx] = cmd;
      } else {
        list.push(cmd);
      }
      return list;
    });
    setEditing(null);
  };

  const removeCommand = (id: string) =>
    setCommands((prev) => prev.filter((c) => c._id !== id));

  const save = async () => {
    setErrors([]);
    try {
      setSaving(true);
      // Preserve every top-level key, then overlay the two we edit. Nested GlobalSettings
      // objects are merged (spread) so unrendered leaves survive; Commands drop the _id.
      const json: Record<string, any> = {
        ...root,
        GlobalSettings: {
          ...(root.GlobalSettings ?? {}),
          ...global,
        },
        Commands: commands.map(({_id, ...rest}) => rest),
      };
      await configurationService.update(SECTION, json, version);
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

  const retry = (global.RetryPolicy ?? {}) as Record<string, any>;
  const xml = (global.XmlSettings ?? {}) as Record<string, any>;
  const json = (global.JsonSettings ?? {}) as Record<string, any>;

  return (
    <div className="space-y-4">
      {/* GlobalSettings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("configuration.externalCommands.globalSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("configuration.externalCommands.maxConcurrentExecutions")}</Label>
              <Input type="number" value={global.MaxConcurrentExecutions ?? ""}
                     onChange={(e) => setGlobalField("MaxConcurrentExecutions", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.externalCommands.commandTimeout")}</Label>
              <Input type="number" value={global.CommandTimeout ?? ""}
                     onChange={(e) => setGlobalField("CommandTimeout", e.target.value)}/>
            </div>
          </div>
          <div>
            <Label>{t("configuration.externalCommands.fileEncoding")}</Label>
            <Input value={global.FileEncoding ?? ""}
                   onChange={(e) => setGlobalField("FileEncoding", e.target.value)}/>
          </div>

          <Separator/>
          <p className="text-sm font-medium">{t("configuration.externalCommands.retryPolicy")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("configuration.externalCommands.maxRetries")}</Label>
              <Input type="number" value={retry.MaxRetries ?? ""}
                     onChange={(e) => setGlobalNested("RetryPolicy", "MaxRetries", e.target.value)}/>
            </div>
            <div>
              <Label>{t("configuration.externalCommands.retryDelaySeconds")}</Label>
              <Input type="number" value={retry.RetryDelaySeconds ?? ""}
                     onChange={(e) => setGlobalNested("RetryPolicy", "RetryDelaySeconds", e.target.value)}/>
            </div>
          </div>
          <div>
            <Label>{t("configuration.externalCommands.retryOnErrors")}</Label>
            <Input value={(retry.RetryOnErrors ?? []).join(", ")}
                   onChange={(e) => setGlobalNested("RetryPolicy", "RetryOnErrors",
                     e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}/>
            <p className="text-xs text-muted-foreground">{t("configuration.externalCommands.commaSeparated")}</p>
          </div>

          <Separator/>
          <p className="text-sm font-medium">{t("configuration.externalCommands.xmlSettings")}</p>
          <div>
            <Label>{t("configuration.externalCommands.rootElementName")}</Label>
            <Input value={xml.RootElementName ?? ""}
                   onChange={(e) => setGlobalNested("XmlSettings", "RootElementName", e.target.value)}/>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="cursor-pointer">{t("configuration.externalCommands.includeXmlDeclaration")}</Label>
            <Switch checked={isTrue(xml.IncludeXmlDeclaration)}
                    onCheckedChange={(v) => setGlobalNested("XmlSettings", "IncludeXmlDeclaration", boolStr(v))}/>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="cursor-pointer">{t("configuration.externalCommands.indentXml")}</Label>
            <Switch checked={isTrue(xml.IndentXml)}
                    onCheckedChange={(v) => setGlobalNested("XmlSettings", "IndentXml", boolStr(v))}/>
          </div>

          <Separator/>
          <p className="text-sm font-medium">{t("configuration.externalCommands.jsonSettings")}</p>
          <div>
            <Label>{t("configuration.externalCommands.dateFormat")}</Label>
            <Input value={json.DateFormat ?? ""}
                   onChange={(e) => setGlobalNested("JsonSettings", "DateFormat", e.target.value)}/>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="cursor-pointer">{t("configuration.externalCommands.camelCasePropertyNames")}</Label>
            <Switch checked={isTrue(json.CamelCasePropertyNames)}
                    onCheckedChange={(v) => setGlobalNested("JsonSettings", "CamelCasePropertyNames", boolStr(v))}/>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label className="cursor-pointer">{t("configuration.externalCommands.indentJson")}</Label>
            <Switch checked={isTrue(json.IndentJson)}
                    onCheckedChange={(v) => setGlobalNested("JsonSettings", "IndentJson", boolStr(v))}/>
          </div>
        </CardContent>
      </Card>

      {/* Commands */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{t("configuration.externalCommands.commands")}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setEditing(newCommand())}>
            <Plus className="h-4 w-4 mr-1"/>{t("add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[55vh] overflow-auto py-4">
          {commands.map((cmd) => (
            <div key={cmd._id} className="flex items-center gap-2 rounded-md border bg-card px-2 py-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{cmd.Name || cmd.Id || "—"}</div>
                <div className="text-xs text-muted-foreground truncate">{cmd.Id}</div>
              </div>
              {cmd.ObjectType && <Badge variant="outline">{cmd.ObjectType}</Badge>}
              <Badge variant={isTrue(cmd.Enabled) ? "default" : "secondary"}>
                {isTrue(cmd.Enabled)
                  ? t("configuration.externalCommands.enabled")
                  : t("configuration.externalCommands.disabled")}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => setEditing(cmd)}>
                <Pencil className="h-4 w-4"/>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPendingDelete(cmd)}>
                <Trash2 className="h-4 w-4 text-destructive"/>
              </Button>
            </div>
          ))}
          {commands.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t("configuration.externalCommands.noCommands")}
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

      <EditorActionBar onShowHistory={() => setShowHistory(true)}>
        <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1"/>{t("save")}</Button>
      </EditorActionBar>

      {editing && (
        <CommandDialog command={editing} onCancel={() => setEditing(null)} onSave={upsertCommand}/>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("configuration.externalCommands.deleteCommandConfirm",
                {name: pendingDelete?.Name || pendingDelete?.Id || "—"})}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  removeCommand(pendingDelete._id);
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

/** A fresh command seeded with the same defaults as the POCO. */
const newCommand = (): CommandItem => ({
  _id: nextId(),
  Id: "",
  Name: "",
  Description: "",
  ObjectType: "GoodsReceipt",
  TriggerType: "Manual",
  Enabled: "true",
  AllowBatchExecution: "false",
  Queries: [],
  FileFormat: "XML",
  FileNamePattern: "",
  Destination: {Type: "LocalPath", Path: ""},
});

const CommandDialog: React.FC<{
  command: CommandItem;
  onCancel: () => void;
  onSave: (c: CommandItem) => void;
}> =
  ({command, onCancel, onSave}) => {
    const {t} = useTranslation();
    const [draft, setDraft] = useState<CommandItem>({
      ...command,
      Queries: Array.isArray(command.Queries) ? command.Queries.map((q: any) => ({...q})) : [],
      Destination: {...(command.Destination ?? {})},
    });
    const set = (k: string, v: any) => setDraft((d) => ({...d, [k]: v}));
    const setDest = (k: string, v: any) =>
      setDraft((d) => ({...d, Destination: {...(d.Destination ?? {}), [k]: v}}));

    const queries: any[] = draft.Queries ?? [];
    const setQuery = (idx: number, k: string, v: any) =>
      setDraft((d) => {
        const list = [...(d.Queries ?? [])];
        list[idx] = {...list[idx], [k]: v};
        return {...d, Queries: list};
      });
    const addQuery = () =>
      setDraft((d) => ({
        ...d,
        Queries: [...(d.Queries ?? []), {Name: "", Query: "", ResultType: "Single", IsBatchQuery: "false"}],
      }));
    const removeQuery = (idx: number) =>
      setDraft((d) => ({...d, Queries: (d.Queries ?? []).filter((_, i) => i !== idx)}));

    const dest = (draft.Destination ?? {}) as Record<string, any>;
    const valid = !!(draft.Id && draft.Name && draft.Description && draft.FileNamePattern && dest.Path);

    return (
      <Dialog open onOpenChange={(o) => !o && onCancel()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{t("configuration.externalCommands.command")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.id")} *</Label>
                <Input value={draft.Id ?? ""} onChange={(e) => set("Id", e.target.value)}/>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.name")} *</Label>
                <Input value={draft.Name ?? ""} onChange={(e) => set("Name", e.target.value)}/>
              </div>
            </div>
            <div>
              <Label>{t("configuration.description")} *</Label>
              <Input value={draft.Description ?? ""} onChange={(e) => set("Description", e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.objectType")}</Label>
                <Select value={draft.ObjectType ?? "GoodsReceipt"} onValueChange={(v) => set("ObjectType", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {OBJECT_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.triggerType")}</Label>
                <Select value={draft.TriggerType ?? "Manual"} onValueChange={(v) => set("TriggerType", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label className="cursor-pointer">{t("configuration.externalCommands.enabled")}</Label>
                <Switch checked={isTrue(draft.Enabled)} onCheckedChange={(v) => set("Enabled", boolStr(v))}/>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label className="cursor-pointer">{t("configuration.externalCommands.allowBatchExecution")}</Label>
                <Switch checked={isTrue(draft.AllowBatchExecution)}
                        onCheckedChange={(v) => set("AllowBatchExecution", boolStr(v))}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.fileFormat")}</Label>
                <Select value={draft.FileFormat ?? "XML"} onValueChange={(v) => set("FileFormat", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {FILE_FORMATS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.fileNamePattern")} *</Label>
                <Input value={draft.FileNamePattern ?? ""} onChange={(e) => set("FileNamePattern", e.target.value)}/>
              </div>
            </div>

            <Separator/>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t("configuration.externalCommands.queries")}</p>
              <Button size="sm" variant="outline" onClick={addQuery}>
                <Plus className="h-4 w-4 mr-1"/>{t("add")}
              </Button>
            </div>
            {queries.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("configuration.externalCommands.noQueries")}</p>
            )}
            {queries.map((q, idx) => (
              <div key={idx} className="rounded-md border px-3 py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Input className="flex-1" placeholder={t("configuration.externalCommands.queryName")}
                         value={q.Name ?? ""} onChange={(e) => setQuery(idx, "Name", e.target.value)}/>
                  <Button size="sm" variant="ghost" onClick={() => removeQuery(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
                <Textarea className="font-mono text-xs" rows={2}
                          placeholder={t("configuration.externalCommands.querySql")}
                          value={q.Query ?? ""} onChange={(e) => setQuery(idx, "Query", e.target.value)}/>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <Label className="text-xs">{t("configuration.externalCommands.resultType")}</Label>
                    <Select value={q.ResultType ?? "Single"} onValueChange={(v) => setQuery(idx, "ResultType", v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {RESULT_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label className="cursor-pointer text-xs">{t("configuration.externalCommands.isBatchQuery")}</Label>
                    <Switch checked={isTrue(q.IsBatchQuery)}
                            onCheckedChange={(v) => setQuery(idx, "IsBatchQuery", boolStr(v))}/>
                  </div>
                </div>
              </div>
            ))}

            <Separator/>
            <p className="text-sm font-medium">{t("configuration.externalCommands.destination")}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.destinationType")}</Label>
                <Select value={dest.Type ?? "LocalPath"} onValueChange={(v) => setDest("Type", v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {DESTINATION_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.path")} *</Label>
                <Input value={dest.Path ?? ""} onChange={(e) => setDest("Path", e.target.value)}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.host")}</Label>
                <Input value={dest.Host ?? ""} onChange={(e) => setDest("Host", e.target.value)}/>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.port")}</Label>
                <Input type="number" value={dest.Port ?? ""} onChange={(e) => setDest("Port", e.target.value)}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("configuration.externalCommands.username")}</Label>
                <Input value={dest.Username ?? ""} onChange={(e) => setDest("Username", e.target.value)}/>
              </div>
              <div>
                <Label>{t("configuration.externalCommands.password")}</Label>
                <Input type="password" value={dest.Password ?? ""}
                       onChange={(e) => setDest("Password", e.target.value)}/>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label className="cursor-pointer text-xs">{t("configuration.externalCommands.usePassiveMode")}</Label>
                <Switch checked={isTrue(dest.UsePassiveMode)}
                        onCheckedChange={(v) => setDest("UsePassiveMode", boolStr(v))}/>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label className="cursor-pointer text-xs">{t("configuration.externalCommands.useSsl")}</Label>
                <Switch checked={isTrue(dest.UseSsl)} onCheckedChange={(v) => setDest("UseSsl", boolStr(v))}/>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label className="cursor-pointer text-xs">
                  {t("configuration.externalCommands.useNetworkImpersonation")}
                </Label>
                <Switch checked={isTrue(dest.UseNetworkImpersonation)}
                        onCheckedChange={(v) => setDest("UseNetworkImpersonation", boolStr(v))}/>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>{t("cancel")}</Button>
            <Button disabled={!valid} onClick={() => onSave(draft)}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export default ExternalCommandsEditor;
