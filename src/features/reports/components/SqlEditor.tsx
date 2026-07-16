import {useMemo} from "react";
import CodeMirror from "@uiw/react-codemirror";
import {MSSQL, sql} from "@codemirror/lang-sql";
import {cn} from "@/utils/css-utils";

/**
 * A CodeMirror 6 SQL editor for the report authoring screens.
 *
 * The dialect is pinned to **MSSQL** on purpose: reports only ever run against SAP B1's SQL Server
 * (`ReportingConnection`, falling back to `ExternalAdapterConnection`), so bracket-quoted
 * identifiers, `OFFSET … FETCH`, and T-SQL keywords must highlight correctly. `StandardSQL` would
 * mis-lex `[Column]` as a nonsense token.
 *
 * This component is presentational only — it never validates the SQL. Validation is a **server**
 * concern: only SQL Server can say whether a query parses, binds, and what columns it returns, and
 * the authoring form gets that answer from `reportDefinitionService.test()`. A client-side lexer
 * here would be a second, weaker, out-of-sync opinion.
 */

export interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Renders the SQL read-only (still highlighted and selectable) — e.g. a non-superuser preview. */
  readOnly?: boolean;
  placeholder?: string;
  /** CSS length, e.g. `"16rem"`. Defaults to `"14rem"`. */
  minHeight?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function SqlEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  minHeight = "14rem",
  className,
  id,
  "aria-label": ariaLabel,
}: SqlEditorProps) {
  // Rebuilding the language extension on every keystroke would tear down and re-create the editor's
  // language state, losing the undo history — so it is memoized to a stable identity.
  const extensions = useMemo(() => [sql({dialect: MSSQL, upperCaseKeywords: true})], []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background text-sm",
        readOnly && "opacity-90",
        className,
      )}
      id={id}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        editable={!readOnly}
        readOnly={readOnly}
        placeholder={placeholder}
        minHeight={minHeight}
        aria-label={ariaLabel}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          autocompletion: !readOnly,
        }}
      />
    </div>
  );
}

export default SqlEditor;
