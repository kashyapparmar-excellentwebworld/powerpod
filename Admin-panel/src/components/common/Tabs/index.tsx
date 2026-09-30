import { Tabs as MuiTabs, Tab as MuiTab } from "@mui/material";
import type { SyntheticEvent } from "react";

export interface TabsProps {
  tabList: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tabs = ({ tabList, value, onChange, className }: TabsProps) => {
  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className={className}>
      <MuiTabs
        value={value}
        onChange={handleChange}
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.grey[200]}`,
          "& .MuiTabs-indicator": {
            display: "flex",
            justifyContent: "center",
            backgroundColor: "transparent",
            height: "4px",
            "&::after": {
              content: '""',
              width: "120px",
              height: "4px",
              backgroundColor: theme.palette.secondary.main,
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              opacity: 1,
            },
          },
        })}
      >
        {tabList.map((tab) => (
          <MuiTab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            sx={(theme) => ({
              textTransform: "none",
              minWidth: 0,
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 16px",
              color: theme.palette.grey[600],
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: 700,
                borderRadius: "12px 12px 0 0",
                backgroundImage: `linear-gradient(180deg, rgba(10, 92, 92, 0) 0%, rgba(10, 92, 92, 0.1) 71.15%, rgba(10, 92, 92, 0.2) 100%)`,
              },
              "&:not(.Mui-selected):hover": {
                color: theme.palette.primary.main,
                fontWeight: 700,
                borderRadius: "12px 12px 0 0",
                backgroundImage: `linear-gradient(180deg, rgba(10, 92, 92, 0) 0%, rgba(10, 92, 92, 0.1) 71.15%, rgba(10, 92, 92, 0.2) 100%)`,
              },
              "&.Mui-selected:hover": {
                backgroundImage: `linear-gradient(180deg, rgba(10, 92, 92, 0) 0%, rgba(10, 92, 92, 0.1) 71.15%, rgba(10, 92, 92, 0.2) 100%)`,
              },
            })}
          />
        ))}
      </MuiTabs>
    </div>
  );
};
