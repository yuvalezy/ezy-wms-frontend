import React, {forwardRef, useImperativeHandle, useState} from "react";
import {useTranslation} from "react-i18next";
import {Accordion, AccordionContent, AccordionItem} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Eraser} from "lucide-react";
import {Status} from "@/features/shared/data";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";

/**
 * The statuses a transfer can actually reach, in lifecycle order. Processing is transient (it only exists
 * while a post to SAP is in flight) so it is not offered as a filter.
 */
export const TRANSFER_FILTER_STATUSES: Status[] = [
  Status.Open,
  Status.InProgress,
  Status.WaitingForApproval,
  Status.Finished,
  Status.Rejected,
  Status.Cancelled,
];

/** What the supervisor list has always shown: the transfers still being worked on. */
export const DEFAULT_TRANSFER_STATUSES: Status[] = [
  Status.Open,
  Status.InProgress,
  Status.WaitingForApproval,
];

export interface TransferStatusFilterRef {
  togglePanel: () => void;
}

interface TransferStatusFilterProps {
  value: Status[];
  onChange: (statuses: Status[]) => void;
}

export default forwardRef<TransferStatusFilterRef, TransferStatusFilterProps>(({value, onChange}, ref) => {
  const {t} = useTranslation();
  const documentStatusToString = useDocumentStatusToString();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    togglePanel: () => setIsPanelOpen((open) => !open),
  }));

  const toggle = (status: Status, checked: boolean) => {
    // Rebuild from the canonical list rather than appending, so the order stays stable however it is clicked.
    onChange(TRANSFER_FILTER_STATUSES.filter((s) =>
      s === status ? checked : value.includes(s)
    ));
  };

  return (
    <Accordion type="single" collapsible className="w-full mb-4" value={isPanelOpen ? "filters-panel" : ""}
               onValueChange={(v: string) => setIsPanelOpen(v === "filters-panel")}>
      <AccordionItem value="filters-panel">
        <AccordionContent>
          <div className="space-y-4 p-1">
            <div>
              <Label className="text-sm font-semibold">{t("status")}</Label>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
                {TRANSFER_FILTER_STATUSES.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={value.includes(status)}
                      onCheckedChange={(checked) => toggle(status, checked === true)}
                    />
                    <Label htmlFor={`status-${status}`} className="cursor-pointer font-normal">
                      {documentStatusToString(status)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onChange(DEFAULT_TRANSFER_STATUSES)}>
              <Eraser className="mr-2 h-4 w-4"/>{t("clear")}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
