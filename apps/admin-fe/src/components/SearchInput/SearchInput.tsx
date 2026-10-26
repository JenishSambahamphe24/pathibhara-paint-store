import { useDebouncedValue } from "@tanstack/react-pacer";
import clsx from "clsx";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  wait?: number;
  className?: string;
  inputMode?: "text" | "decimal" | "numeric";
  /** Rewrites each keystroke before it reaches the box — used to keep a
   *  numeric-only search from accepting letters at all. */
  sanitize?: (raw: string) => string;
}

export function SearchInput({
  onSearch,
  placeholder,
  wait = 300,
  className,
  inputMode,
  sanitize,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebouncedValue(value, { wait });

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue]);

  return (
    <div className={clsx("relative", className)}>
      <Search
        size={16}
        className="absolute top-1/2 left-3 -translate-y-1/2 text-foreground-faint"
      />
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) =>
          setValue(sanitize ? sanitize(e.target.value) : e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-border-strong py-2 pr-3 pl-9 text-sm text-foreground placeholder-foreground-faint transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10 focus:outline-none"
      />
    </div>
  );
}
