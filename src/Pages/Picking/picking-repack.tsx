import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {CheckCircle, PackageCheck, RotateCcw} from "lucide-react";

import ContentTheme from "@/components/ContentTheme";
import BarCodeScanner from "@/components/BarCodeScanner";
import {BarCodeScannerRef} from "@/components/BarCodeScanner/types";
import {useThemeContext} from "@/components/ThemeContext";
import {MessageBox} from "@/components";
import {StringFormat} from "@/utils/string-utils";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Alert, AlertDescription} from "@/components/ui/alert";
import PickingPackageLabelControls from "@/features/picking/components/picking-package-label-controls";
import {PickingPackageLabel, PickingRepackSummary} from "@/features/picking/data/picking";
import {pickingService} from "@/features/picking/data/picking-service";
import {ObjectType} from "@/features/shared/data";
import {AddItemValue} from "@/components/BarCodeScanner/types";
import {formatNumber} from "@/utils/number-utils";
import {useAuth} from "@/components";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

export default function PickingRepack() {
  const {id} = useParams<{ id: string }>();
  const pickListId = Number(id);
  const {t} = useTranslation();
  const {user} = useAuth();
  const navigate = useNavigate();
  const {setLoading, setError} = useThemeContext();
  const scannerRef = useRef<BarCodeScannerRef>(null);
  const [summary, setSummary] = useState<PickingRepackSummary | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "restart" | "complete">(null);

  const labels = summary?.labels ?? [];
  const progress = summary && summary.totalLines > 0 ? summary.assignedLines * 100 / summary.totalLines : 0;
  const selectedLabel = useMemo(
    () => labels.find(label => label.id === selectedLabelId) ?? null,
    [labels, selectedLabelId]
  );
  const canComplete = summary != null && summary.totalLines > 0 && summary.assignedLines > 0 && !summary.completed;
  const canManageRepack = user?.superUser || user?.roles?.includes(RoleType.PICKING_SUPERVISOR);
  const canAssign = summary?.started === true && summary?.completed !== true;
  const sortedItems = useMemo(() => {
    const getPriority = (item: PickingRepackSummary["items"][number]) => {
      if (item.totalLines > 0 && item.assignedLines === item.totalLines) {
        return 2;
      }
      if (item.assignedLines > 0) {
        return 0;
      }
      return 1;
    };

    return [...(summary?.items ?? [])].sort((a, b) => {
      const priority = getPriority(a) - getPriority(b);
      if (priority !== 0) {
        return priority;
      }

      const itemCode = a.itemCode.localeCompare(b.itemCode);
      if (itemCode !== 0) {
        return itemCode;
      }

      return String(a.unit).localeCompare(String(b.unit));
    });
  }, [summary?.items]);

  useEffect(() => {
    if (!Number.isFinite(pickListId)) {
      setError(t("invalidID"));
      return;
    }

    setLoading(true);
    pickingService.getRepackSummary(pickListId)
      .then(data => {
        setSummary(data);
        const firstLabel = data.labels[0];
        if (firstLabel) {
          setSelectedLabelId(firstLabel.id);
          setTimeout(() => scannerRef.current?.focus(), 1);
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }, [pickListId]);

  function refresh(selectLabelId?: string) {
    return pickingService.getRepackSummary(pickListId)
      .then(data => {
        setSummary(data);
        setSelectedLabelId(current => {
          if (selectLabelId !== undefined) {
            return selectLabelId;
          }
          return current && data.labels.some(label => label.id === current) ? current : data.labels[0]?.id ?? null;
        });
        setTimeout(() => scannerRef.current?.focus(), 1);
      })
      .catch(error => setError(error));
  }

  function createLabel(source: PickingRepackSummary | null = summary) {
    if (!source?.started || source.completed) {
      return;
    }

    setCreatingLabel(true);
    pickingService.createPackageLabel(pickListId)
      .then((label: PickingPackageLabel) => refresh(label.id))
      .catch(error => setError(error))
      .finally(() => setCreatingLabel(false));
  }

  function handleLabelSelected(labelId: string | null) {
    setSelectedLabelId(labelId);
    setTimeout(() => scannerRef.current?.focus(), 1);
  }

  function handleAddItem(value: AddItemValue) {
    if (!canAssign) {
      toast.error(t("repackNotStarted"));
      setTimeout(() => scannerRef.current?.focus(), 100);
      return;
    }

    if (!selectedLabelId) {
      toast.error(t("selectPickingPackageLabel"));
      setTimeout(() => scannerRef.current?.focus(), 100);
      return;
    }

    setAssigning(true);
    pickingService.assignRepackItem(pickListId, {
      pickingPackageLabelId: selectedLabelId,
      itemCode: value.item.code,
      unit: value.unit,
    })
      .then(response => {
        scannerRef.current?.clear();
        if (!response.success) {
          toast.error(response.errorMessage ?? t("unknownError"));
          if (response.summary) {
            setSummary(response.summary);
          }
          return;
        }
        if (response.summary) {
          setSummary(response.summary);
        }
        toast.success(t("repackAssignedToLabel", {item: value.item.code, label: selectedLabel?.code ?? ""}));
      })
      .catch(error => setError(error))
      .finally(() => {
        setAssigning(false);
        setTimeout(() => scannerRef.current?.focus(), 100);
      });
  }

  function completeRepack() {
    setLoading(true);
    pickingService.completeRepack(pickListId)
      .then(data => {
        setSummary(data);
        toast.success(t("repackCompleted"));
        navigate("/pickSupervisor");
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }

  function restartRepack() {
    setLoading(true);
    pickingService.restartRepack(pickListId)
      .then(data => {
        setSummary(data);
        setSelectedLabelId(data.labels[0]?.id ?? null);
        toast.success(t("repackRestarted"));
        setTimeout(() => scannerRef.current?.focus(), 1);
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));
  }

  function getItemRowClass(item: PickingRepackSummary["items"][number]) {
    if (item.totalLines > 0 && item.assignedLines === item.totalLines) {
      return "border-l-4 border-emerald-500 bg-emerald-50 text-slate-500 hover:bg-emerald-100";
    }

    if (item.assignedLines > 0) {
      return "border-l-4 border-amber-500 bg-amber-50 hover:bg-amber-100";
    }

    return "";
  }

  return (
    <ContentTheme
      title={t("pickingRepack")}
      titleOnClick={() => navigate("/pick")}
      titleBreadcrumbs={[{label: `#${id}`}]}
      footer={summary && canAssign && (
        <>
          <PickingPackageLabelControls
            labels={labels}
            selectedLabelId={selectedLabelId}
            creating={creatingLabel}
            onSelect={handleLabelSelected}
            onCreate={() => createLabel()}
          />
          <BarCodeScanner
            ref={scannerRef}
            enabled={canAssign && !assigning && selectedLabelId != null}
            unit
            objectType={ObjectType.Picking}
            onAddItem={handleAddItem}
          />
        </>
      )}
    >
      {summary && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-slate-600"/>
                <span className="font-semibold">{t("assigned")}: {summary.assignedLines} / {summary.totalLines}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={progress} className="max-w-xs"/>
                <span className="text-sm text-muted-foreground">{formatNumber(progress, 0)}%</span>
              </div>
            </div>
            {canManageRepack && (
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" disabled={!summary.started}
                        onClick={() => setConfirmAction("restart")}>
                  <RotateCcw className="mr-2 h-4 w-4"/>
                  {t("restartRepack")}
                </Button>
                <Button type="button" disabled={!canComplete} onClick={() => setConfirmAction("complete")}>
                  <CheckCircle className="mr-2 h-4 w-4"/>
                  {t("completeRepack")}
                </Button>
              </div>
            )}
          </div>

          {!summary.started && (
            <Alert variant="default">
              <AlertDescription>{t("repackNotStarted")}</AlertDescription>
            </Alert>
          )}

          {summary.completed && (
            <Alert variant="information">
              <AlertDescription>{t("repackCompleted")}</AlertDescription>
            </Alert>
          )}

          {canAssign && summary.assignedLines < summary.totalLines && (
            <Alert variant="default">
              <AlertDescription>{t("repackIncomplete")}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("item")}</TableHead>
                <TableHead>{t("unit")}</TableHead>
                <TableHead className="text-right">{t("lines")}</TableHead>
                <TableHead className="text-right">{t("quantity")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map(item => (
                <TableRow key={`${item.itemCode}-${item.unit}`} className={getItemRowClass(item)}>
                  <TableCell className="font-medium">{item.itemCode}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{item.assignedLines} / {item.totalLines}</TableCell>
                  <TableCell className="text-right">{item.assignedQuantity} / {item.totalQuantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <MessageBox
        open={confirmAction !== null}
        onOpenChange={open => { if (!open) setConfirmAction(null); }}
        type="confirm"
        title={confirmAction === "restart"
          ? StringFormat(t("confirmRestartRepack"), id ?? "")
          : t("confirmCompleteRepack")}
        description={confirmAction === "restart" ? t("restartRepackWarning") : t("completeRepackWarning")}
        confirmText={confirmAction === "restart" ? t("restartRepack") : t("completeRepack")}
        cancelText={t("cancel")}
        confirmButtonVariant={confirmAction === "restart" ? "destructive" : "default"}
        onConfirm={() => {
          const action = confirmAction;
          setConfirmAction(null);
          if (action === "restart") {
            restartRepack();
          } else if (action === "complete") {
            completeRepack();
          }
        }}
      />
    </ContentTheme>
  );
}
