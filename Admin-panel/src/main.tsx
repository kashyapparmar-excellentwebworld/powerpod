import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import { AppThemeProvider } from "./components/AppThemeProvider";
import Loader from "./components/common/Loader/Loader";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppThemeProvider>
            <Suspense
              fallback={
                <div className="h-screen flex items-center justify-center bg-white">
                  <Loader />
                </div>
              }
            >
              <App />
            </Suspense>
            <Toaster />
          </AppThemeProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>,
);
