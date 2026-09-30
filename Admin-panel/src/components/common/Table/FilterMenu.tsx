import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

type FilterMenuProps = {
  anchorElId: string | null;
  setAnchorElId: (id: string | null) => void;
  menuId: string;
  render: ReactNode;
};

const FilterMenu = ({ anchorElId, setAnchorElId, menuId, render }: FilterMenuProps) => {
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const handleClose = () => {
    setAnchorElId(null);
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (anchorElId === menuId) {
      const button = document.getElementById(menuId);
      if (button) {
        const rect = button.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + window.scrollY,
          left: rect.right - 192,
        });
      }
    }
  }, [anchorElId, menuId]);

  if (anchorElId !== menuId) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      <div
        className="fixed z-50 w-48"
        style={{
          top: `${buttonPosition.top}px`,
          left: `${buttonPosition.left}px`,
        }}
      >
        <div className="bg-white rounded-lg border  border-gray-300 shadow-lg overflow-y-auto">{render}</div>
      </div>
    </>,
    document.body
  );
};

export default FilterMenu;
