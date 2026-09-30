import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
}

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  onClear,
  className = "w-full",
}: SearchInputProps) => {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
      />
      {value && value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            if (onClear) {
              onClear();
            } else if (onChange) {
              // Fallback to calling onChange with an empty event-like object if onClear is not provided
              onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
export { SearchInput };
