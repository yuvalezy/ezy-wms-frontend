import * as React from "react";
import {Check, ChevronsUpDown} from "lucide-react";
import {cn} from "@/utils/css-utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";

export interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** When set, prepends a clear item that emits the empty string ("") via onChange. */
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A searchable single-select dropdown built from Popover + a filterable list.
 * Generic API: items {value,label}[], value, onChange, placeholder, searchPlaceholder, allowClear.
 * onChange emits "" when the clear item is selected.
 */
export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  allowClear = false,
  clearLabel = "None",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = React.useMemo(
    () => items.find((i) => i.value === value),
    [items, value],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          {/*
            Falls back to the raw value rather than the placeholder when nothing matches. A value
            with no matching item is still a value — options often arrive async or are a filtered
            top-N set, so "no match" usually means "not loaded", not "nothing selected". Showing the
            placeholder there makes the control claim no filter while one is being applied.
          */}
          <span className="truncate">{selected ? selected.label : value || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <div className="p-2 border-b">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-auto p-1">
          {allowClear && (
            <button
              type="button"
              onClick={() => select("")}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Check className={cn("h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
              <span className="truncate">{clearLabel}</span>
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => select(item.value)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Check className={cn("h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                <span className="truncate">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
