"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/apiClient";
import { useT } from "@/store/useLangStore";
export function useStepSave(app, onApp) {
  const { t, te } = useT();
  const [busy, setBusy] = useState("");
  const save = async (step, data, complete = false, quiet = false) => {
    setBusy(complete ? "next" : "save");
    try {
      const d = await apiPost(`/api/applications/${app.id}/step`, { step, data, complete });
      onApp(d.application, complete);
      if (!quiet) toast.success(complete ? t("stepDone") : t("saved"));
      return true;
    } catch (e) {
      toast.error(te(e.code));
      return false;
    } finally {
      setBusy("");
    }
  };
  return { save, busy };
}
