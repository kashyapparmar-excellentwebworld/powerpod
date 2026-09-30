import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "../../../../hooks/useToast";
import { logout } from "../../../../redux/slices/authSlice";
import { useAppDispatch } from "../../../../hooks/redux";
import { Modal } from "../Modal";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAPI } from "../../../../features/Auth/api";

interface modalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const LogoutModal: React.FC<modalProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutAPI();
      dispatch(logout());
      showToast("Logged out successfully", "success");
      setOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setOpen(false);
      // We still force logout locally even if server fails to clear token
      dispatch(logout());
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen} maxWidth="xs">
      <div className="flex flex-col items-center justify-center px-2 py-4">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full border flex items-center justify-center border-primary/20 bg-primary/5 mb-5 shadow-sm">
          <LogOut className="w-8 h-8 text-primary" strokeWidth={2} />
        </div>
        
        {/* Title & Description */}
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">
          Logout Account?
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 px-2">
          Are you sure want to logout your account?
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-[260px] mx-auto">
          <button
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(107,47,217,0.39)] transition-all cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
