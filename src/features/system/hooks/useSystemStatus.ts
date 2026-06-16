import {useCallback, useEffect, useRef, useState} from "react";
import {SystemStatus, systemService} from "../data/system-service";

/**
 * Polls the SAP/SBO readiness status used by the lockdown gate. Re-checks on a
 * timer while not ready, and immediately when the SBO editor fires the
 * "ezy:system-status" event after a save/recheck.
 */
export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const latest = useRef<SystemStatus | undefined>(undefined);

  const reload = useCallback(async () => {
    try {
      const s = await systemService.getStatus();
      latest.current = s;
      setStatus(s);
    } catch {
      // Don't hard-lock on a transient network error: keep the last known status,
      // or assume "not ready" only if we never got one.
      if (!latest.current) {
        const fallback: SystemStatus = {ready: false, sboConfigured: false, detail: "Unable to reach the server."};
        latest.current = fallback;
        setStatus(fallback);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onEvent = () => void reload();
    window.addEventListener("ezy:system-status", onEvent);
    const interval = window.setInterval(() => {
      if (!latest.current?.ready) {
        void reload();
      }
    }, 15000);
    return () => {
      window.removeEventListener("ezy:system-status", onEvent);
      window.clearInterval(interval);
    };
  }, [reload]);

  return {status, loading, reload};
}
