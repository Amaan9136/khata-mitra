"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/apiClient";
import { useT } from "@/store/useLangStore";
export function useAi(appId, onApp) {
  const { lang, t, te } = useT();
  const [busy, setBusy] = useState("");
  const run = async (task, extra = {}) => {
    setBusy(`${task}${extra.docId || ""}`);
    try {
      const d = await apiPost(`/api/applications/${appId}/ai`, { task, lang, ...extra });
      onApp(d.application);
      return d;
    } catch (e) {
      toast.error(e.code?.startsWith("ai_") ? t(`ai_${e.code}`) : te(e.code));
      return null;
    } finally {
      setBusy("");
    }
  };
  return { run, busy };
}
