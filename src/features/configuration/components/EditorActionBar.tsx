import React from "react";
import {useTranslation} from "react-i18next";
import {History} from "lucide-react";
import {Button} from "@/components/ui/button";

interface Props {
  onShowHistory: () => void;
  /** The section's own actions (validate, test connection, save…), rendered right-aligned. */
  children: React.ReactNode;
}

/**
 * Shared footer for the configuration section editors: history on the left, the section's
 * own actions on the right. Sticks to the bottom of ContentTheme's scroll area so Save stays
 * reachable without scrolling to the end of a long section.
 */
const EditorActionBar: React.FC<Props> = ({onShowHistory, children}) => {
  const {t} = useTranslation();
  return (
    <div
      className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t
        bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button type="button" variant="ghost" onClick={onShowHistory}>
        <History className="h-4 w-4 mr-1"/>{t("configuration.history")}
      </Button>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

export default EditorActionBar;
