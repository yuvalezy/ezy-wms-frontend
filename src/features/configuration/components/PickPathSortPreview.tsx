import React from "react";
import {useTranslation} from "react-i18next";
import {ArrowRight} from "lucide-react";
import {parseSortKeyTokens, sortBinCodes} from "@/features/picking/utils/bin-code-sort";

interface Props {
  sortKey?: string;
  enabled: boolean;
}

/** Fixed demo bin set — enough segments/duplicated aisles to make sort-order differences visible. */
const DEMO_BIN_CODES = ["A1", "A2", "A3", "A10", "B1", "B2", "B3", "B10", "C1", "C2"];

/** Live preview of the walk order a PickPathSortKey expression produces (Options > Picking). */
const PickPathSortPreview: React.FC<Props> = ({sortKey, enabled}) => {
  const {t} = useTranslation();

  if (!enabled) {
    return null;
  }

  const hasValue = !!sortKey?.trim();
  const invalid = hasValue && parseSortKeyTokens(sortKey) === null;
  const ordered = sortBinCodes(DEMO_BIN_CODES, sortKey);

  return (
    <div className="pt-2 pb-3 space-y-1">
      <p className="text-xs font-medium text-muted-foreground">
        {t("configuration.options.pickPathPreview.title")}
      </p>
      <div className="flex flex-wrap items-center gap-1 text-sm">
        {ordered.map((code, i) => (
          <React.Fragment key={code}>
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0"/>}
            <span className="font-mono">{code}</span>
          </React.Fragment>
        ))}
      </div>
      {invalid && (
        <p className="text-xs text-destructive">
          {t("configuration.options.pickPathPreview.invalidExpression")}
        </p>
      )}
    </div>
  );
};

export default PickPathSortPreview;
