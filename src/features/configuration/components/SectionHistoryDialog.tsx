import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {History, RotateCcw} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigAuditEntry} from "../data/types";

interface Props {
  section: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored: () => void;
}

const SectionHistoryDialog: React.FC<Props> = ({section, open, onOpenChange, onRestored}) => {
  const {t} = useTranslation();
  const [entries, setEntries] = useState<ConfigAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section]);

  const load = async () => {
    try {
      setLoading(true);
      setEntries(await configurationService.history(section));
    } catch (error) {
      toast.error(`${t("configuration.historyLoadFailed")}: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const restore = async (version: number) => {
    try {
      setRestoring(version);
      await configurationService.restore(section, version);
      toast.success(t("configuration.restored", {version}));
      onRestored();
      onOpenChange(false);
    } catch (error) {
      toast.error(`${t("configuration.restoreFailed")}: ${error}`);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4"/> {t("configuration.history")} — {section}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("configuration.version")}</TableHead>
                <TableHead>{t("configuration.changeType")}</TableHead>
                <TableHead>{t("configuration.changedAt")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}>{t("loading")}</TableCell></TableRow>
              ) : entries.length === 0 ? (
                <TableRow><TableCell colSpan={4}>{t("configuration.noHistory")}</TableCell></TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">v{e.version}</TableCell>
                    <TableCell>{e.changeType}</TableCell>
                    <TableCell>{new Date(e.changedAtUtc).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={restoring !== null}
                              onClick={() => restore(e.version)}>
                        <RotateCcw className="h-4 w-4 mr-1"/>{t("configuration.restore")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionHistoryDialog;
