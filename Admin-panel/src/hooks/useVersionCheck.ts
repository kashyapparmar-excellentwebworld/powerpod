import { useState, useEffect } from "react";
import axios from "axios";

export interface VersionCheckResult {
  status: "success";
  resultState: "MAINTENANCE" | "FORCE_UPDATE" | "OPTIONAL_UPDATE" | "UP_TO_DATE";
  forceUpdate: boolean;
  optionalUpdate: boolean;
  maintenance: boolean;
  latestVersion: string;
  minimumVersion: string;
  title: string;
  message: string;
  updateUrl: string;
  buttonText: string;
  skipButtonText?: string;
}

export function useVersionCheck(currentVersion: string = "1.0.0", platform: string = "web") {
  const [versionState, setVersionState] = useState<VersionCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkVersion() {
      try {
        const lang = localStorage.getItem("i18nextLng") || "en";
        const deviceId = localStorage.getItem("device_id") || `web-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("device_id", deviceId);

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
        const publicUrl = apiBaseUrl.replace(/\/admin$/, "");

        const res = await axios.post(`${publicUrl}/version/check`, {
          platform,
          version: currentVersion,
          language: lang,
          deviceId,
        });

        setVersionState(res.data);
      } catch (err) {
        console.warn("Version check failed, resuming app:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkVersion();
  }, [currentVersion, platform]);

  return { versionState, isLoading };
}
