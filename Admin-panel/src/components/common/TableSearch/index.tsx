import { Search, X } from "lucide-react";

type TableSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: TableSearchProps) {
  return (
    <div className={`w-full sm:w-80 ${className}`}>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 h-11 transition-all duration-200 hover:border-gray-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 shadow-sm">
        <Search className="h-5 w-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 truncate font-medium"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
