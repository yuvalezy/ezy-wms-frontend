import React from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Plus, Tag} from "lucide-react";
import {useTranslation} from "react-i18next";
import {PickingPackageLabel, PickingPackageLabelItem} from "@/features/picking/data/picking";

interface PickingPackageLabelControlsProps {
  labels: PickingPackageLabel[];
  selectedLabelId: string | null;
  creating: boolean;
  onSelect: (labelId: string | null) => void;
  onCreate: () => void;
}

function getItemCode(item: PickingPackageLabelItem): string {
  return String(item.itemCode ?? "");
}

function getItemQuantity(item: PickingPackageLabelItem): number | null {
  const quantity = item.scannedQuantity;
  return typeof quantity === "number" ? quantity : null;
}

export const PickingPackageLabelControls: React.FC<PickingPackageLabelControlsProps> = ({
  labels,
  selectedLabelId,
  creating,
  onSelect,
  onCreate,
}) => {
  const {t} = useTranslation();
  const selectedLabel = labels.find(label => label.id === selectedLabelId) ?? null;
  const selectedValue = selectedLabelId == null ? "none" : selectedLabelId.toString();

  function handleValueChange(value: string) {
    onSelect(value === "none" ? null : value);
  }

  return (
    <div className="border-b bg-slate-50 p-2">
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white">
          <Tag className="h-4 w-4 text-slate-600"/>
        </div>
        <Select value={selectedValue} onValueChange={handleValueChange} disabled={creating}>
          <SelectTrigger className="h-9 flex-1 bg-white">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("noPickingPackageLabel")}</SelectItem>
            {labels.map(label => (
              <SelectItem key={label.id} value={label.id.toString()}>
                {label.code} - {label.lineCount} {t("lines")}, {label.totalQuantity} {t("quantity")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="secondary" size="sm" onClick={onCreate} disabled={creating}>
          <Plus className="h-4 w-4"/>
          {t("newPickingPackageLabel")}
        </Button>
      </div>

      <div className="mt-2 text-xs text-slate-600">
        {selectedLabel ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-800">{selectedLabel.code}</span>
              <Badge variant="outline">{selectedLabel.lineCount} {t("lines")}</Badge>
              <Badge variant="outline">{selectedLabel.totalQuantity} {t("quantity")}</Badge>
            </div>
            {selectedLabel.items.length > 0 ? (
              <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto">
                {selectedLabel.items.map((item, index) => {
                  const code = getItemCode(item);
                  const quantity = getItemQuantity(item);
                  return (
                    <Badge key={`${code}-${index}`} variant="secondary" className="max-w-full truncate">
                      {code || t("item")} {quantity != null ? `x ${quantity}` : ""}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <span>{t("emptyPickingPackageLabel")}</span>
            )}
          </div>
        ) : (
          <span>{t("noPickingPackageLabelSelected")}</span>
        )}
      </div>
    </div>
  );
};

export default PickingPackageLabelControls;
