import { useEffect, useRef, useState } from "react";
import { InputAdornment } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TextInput } from "../TextInput";
import { ChevronDown } from "lucide-react";
import { COUNTRY_CODES } from "../../../constants/countryCode";

export function splitPhone(full: any): {
  countryCode: string;
  localNumber: string;
} {
  const phoneStr = String(full || "");
  if (!phoneStr) return { countryCode: COUNTRY_CODES[0].code, localNumber: "" };

  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );

  for (const { code } of sorted) {
    if (phoneStr.startsWith(code)) {
      return { countryCode: code, localNumber: phoneStr.slice(code.length) };
    }
  }
  return { countryCode: COUNTRY_CODES[0].code, localNumber: phoneStr };
}

export function joinPhone(countryCode: string, localNumber: string): string {
  return `${countryCode}${localNumber}`;
}

function FlagImg({ iso2 }: { iso2: string }) {
  return (
    <img
      src={`https://flagcdn.com/w20/${iso2}.png`}
      srcSet={`https://flagcdn.com/w40/${iso2}.png 2x`}
      alt={iso2.toUpperCase()}
      width={20}
      height={15}
      style={{
        borderRadius: 2,
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

interface PhoneInputFieldProps {
  label: string;
  fieldName: string;
  fullValue: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
}

export function PhoneInputField({
  label,
  fieldName,
  fullValue,
  required,
  error,
  helperText,
  onBlur,
  onChange,
  placeholder,
}: PhoneInputFieldProps) {
  const theme = useTheme();
  const { countryCode, localNumber } = splitPhone(fullValue ?? "");
  const selected =
    COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleSelect = (code: string) => {
    setOpen(false);
    onChange(joinPhone(code, localNumber));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(joinPhone(countryCode, digits));
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <TextInput
        label={label}
        name={fieldName}
        required={required}
        error={error}
        helperText={helperText}
        value={localNumber}
        placeholder={placeholder || "Enter phone number"}
        inputMode="numeric"
        onChange={handleNumberChange}
        onBlur={onBlur}
        sx={{
          "& .MuiInputBase-input": {
            paddingLeft: "8px",
          },
        }}
        slotProps={{
          input: {
            sx: {
              paddingLeft: 0,
              gap: 0,
            },
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{
                  height: "100%",
                  maxHeight: "none",
                  m: 0,
                  alignSelf: "stretch",
                }}
              >
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => COUNTRY_CODES.length > 1 && setOpen((v) => !v)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: "100%",
                    padding: "0 10px 0 14px",
                    background: "transparent",
                    border: "none",
                    borderRight: `1px solid ${theme.palette.grey[200]}`,
                    cursor: COUNTRY_CODES.length > 1 ? "pointer" : "default",
                    flexShrink: 0,
                    outline: "none",
                    marginRight: 4,
                  }}
                >
                  <FlagImg iso2={selected.iso2} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      minWidth: 30,
                      lineHeight: 1,
                    }}
                  >
                    {selected.code}
                  </span>
                  {COUNTRY_CODES.length > 1 && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-150 ${open ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>
              </InputAdornment>
            ),
          },
        }}
      />

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1400,
            background: "#fff",
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            minWidth: 220,
            maxHeight: 252,
            overflowY: "auto",
          }}
        >
          {COUNTRY_CODES.map(({ code, iso2, name }) => {
            const isSel = code === countryCode;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 14px",
                  border: "none",
                  background: isSel ? theme.palette.grey[50] : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    theme.palette.grey[50];
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    isSel ? theme.palette.grey[50] : "transparent";
                }}
              >
                <FlagImg iso2={iso2} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: isSel
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    fontWeight: isSel ? 600 : 400,
                  }}
                >
                  {name}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
