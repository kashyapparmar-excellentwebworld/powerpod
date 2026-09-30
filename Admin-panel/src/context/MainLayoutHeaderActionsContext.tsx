import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

type HeaderActionsContextType = {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
  clearActions: () => void;
};

const MainLayoutHeaderActionsContext =
  createContext<HeaderActionsContextType | null>(null);

export const useMainLayoutHeaderActions = () => {
  const ctx = useContext(MainLayoutHeaderActionsContext);
  if (!ctx)
    throw new Error("useMainLayoutHeaderActions must be used within provider");
  return ctx;
};

export const MainLayoutHeaderActionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [actions, setActions] = useState<ReactNode>(null);

  const clearActions = useCallback(() => setActions(null), []);

  const value = useMemo(
    () => ({ actions, setActions, clearActions }),
    [actions, clearActions],
  );

  return (
    <MainLayoutHeaderActionsContext.Provider value={value}>
      {children}
    </MainLayoutHeaderActionsContext.Provider>
  );
};
