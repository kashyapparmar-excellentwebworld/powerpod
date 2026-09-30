import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Role {
  id: string;
  name: string;
  label: string;
}

interface ModulePermission {
  adminModuleId: number;
  moduleSlug: string;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Access {
  allAccess: boolean;
  modulePermissions: ModulePermission[];
}

interface Admin {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  access?: Access;
}

interface AuthState {
  admin: Admin | null;
  access: Access | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

const localAuth = localStorage.getItem("auth");
const sessionAuth = sessionStorage.getItem("auth");

let parsedAuth = null;
let rememberMe = false;

try {
  if (localAuth) {
    parsedAuth = JSON.parse(localAuth);
    rememberMe = true;
  } else if (sessionAuth) {
    parsedAuth = JSON.parse(sessionAuth);
    rememberMe = false;
  }
} catch (error) {
  parsedAuth = null;
}

const initialState: AuthState = {
  admin: parsedAuth?.admin || null,
  access: parsedAuth?.admin?.access || null,
  accessToken: parsedAuth?.accessToken || null,
  refreshToken: parsedAuth?.refreshToken || null,
  isAuthenticated: !!(parsedAuth?.accessToken),
  rememberMe,
};

const updateStorage = (key: string, updater: (data: any) => any) => {
  const stored = localStorage.getItem(key) || sessionStorage.getItem(key);

  if (!stored) return;

  const parsed = JSON.parse(stored);
  const updated = updater(parsed);

  if (localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(updated));
  } else {
    sessionStorage.setItem(key, JSON.stringify(updated));
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        admin: Admin;
        accessToken: string;
        refreshToken: string;
        rememberMe: boolean;
      }>,
    ) => {
      const { admin, accessToken, refreshToken, rememberMe } = action.payload;

      state.admin = admin;
      state.access = admin.access || null;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.rememberMe = rememberMe;

      const authData = JSON.stringify({
        admin,
        accessToken,
        refreshToken,
      });

      if (rememberMe) {
        localStorage.setItem("auth", authData);
        sessionStorage.removeItem("auth");
      } else {
        sessionStorage.setItem("auth", authData);
        localStorage.removeItem("auth");
      }
    },
    logout: (state) => {
      state.admin = null;
      state.access = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.rememberMe = false;

      localStorage.removeItem("auth");
      sessionStorage.removeItem("auth");
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;

      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      updateStorage("auth", (data) => {
        data.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          data.refreshToken = action.payload.refreshToken;
        }
        return data;
      });
    },
    updateAdmin: (state, action: PayloadAction<Admin>) => {
      state.admin = action.payload;

      const storedL = localStorage.getItem("auth");
      const storedS = sessionStorage.getItem("auth");

      if (storedL) {
        const parsed = JSON.parse(storedL);
        parsed.admin = action.payload;
        localStorage.setItem("auth", JSON.stringify(parsed));
      }

      if (storedS) {
        const parsed = JSON.parse(storedS);
        parsed.admin = action.payload;
        sessionStorage.setItem("auth", JSON.stringify(parsed));
      }
    },
    setAccess: (state, action: PayloadAction<Access>) => {
      state.access = action.payload;
    },
  },
});

export const { login, logout, setTokens, updateAdmin, setAccess } =
  authSlice.actions;

export default authSlice.reducer;
