"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useLangStore } from "@/store/useLangStore";
function LangSync() {
  const hydrate = useLangStore((s) => s.hydrate);
  const lang = useLangStore((s) => s.lang);
  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}
export default function Providers({ children }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <LangSync />
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { background: "#052e2b", color: "#ecfdf5", border: "1px solid rgba(94,234,212,.25)", borderRadius: 999, fontSize: 15, boxShadow: "0 12px 32px rgba(5,46,43,0.3)" }, success: { iconTheme: { primary: "#5eead4", secondary: "#052e2b" } }, error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } } }} />
      {children}
    </SessionProvider>
  );
}