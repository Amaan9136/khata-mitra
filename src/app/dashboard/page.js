"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FiInbox, FiAlertCircle, FiZap, FiCheckCircle, FiSearch, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import ApplicationCard from "@/components/app/ApplicationCard";
import { apiGet } from "@/lib/apiClient";
import { useT } from "@/store/useLangStore";
import { NEEDS_ATTENTION } from "@/lib/priority";
function Kpi({ icon: Icon, label, value, tone }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="card card-hover relative flex items-center gap-4 overflow-hidden p-4 sm:p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-300/20 blur-2xl" />
      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${tone}`}><Icon size={21} /></div>
      <div className="relative"><div className="font-display text-3xl font-bold text-(--text1)">{value}</div><div className="text-xs leading-snug text-(--text2) sm:text-sm">{label}</div></div>
    </motion.div>
  );
}
export default function DashboardPage() {
  const { t, te } = useT();
  const { data: session } = useSession();
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [state, setState] = useState({ items: [], counts: null, loading: true });
  const load = useCallback(async () => {
    try {
      const d = await apiGet(`/api/applications?tab=${tab}&q=${encodeURIComponent(q)}`);
      setState({ items: d.items, counts: d.counts, loading: false });
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast.error(te(e.code));
    }
  }, [tab, q, te]);
  useEffect(() => {
    const id = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(id);
  }, [load, q]);
  const { items, counts } = state;
  const hot = tab === "pending" ? items.filter((a) => a.priority.score >= NEEDS_ATTENTION) : [];
  const rest = tab === "pending" ? items.filter((a) => a.priority.score < NEEDS_ATTENTION) : items;
  return (
    <AppShell title={t("dash.title")}>
      <div className="mb-6">
        <div className="font-display text-2xl font-semibold sm:text-3xl">{t("welcome")}, {session?.user?.name?.split(" ")[0]}</div>
        <div className="text-sm text-(--text2)">{session?.user?.designation} · {session?.user?.office}</div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={FiInbox} label={t("kpi.pending")} value={counts?.pending ?? "–"} tone="bg-linear-to-br from-teal-600 to-emerald-900" />
        <Kpi icon={FiAlertCircle} label={t("kpi.overdue")} value={counts?.overdue ?? "–"} tone="bg-linear-to-br from-red-500 to-red-800" />
        <Kpi icon={FiZap} label={t("kpi.attention")} value={counts?.attention ?? "–"} tone="bg-linear-to-br from-amber-500 to-orange-700" />
        <Kpi icon={FiCheckCircle} label={t("kpi.week")} value={counts?.decidedWeek ?? "–"} tone="bg-linear-to-br from-lime-500 to-green-700" />
      </div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-(--bg3) p-1">
          {["pending", "returned", "decided"].map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`min-h-11 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${tab === k ? "bg-white text-(--accent-dark) shadow" : "text-(--text2)"}`}>{t(`tab.${k}`)}{counts ? ` · ${counts[k]}` : ""}</button>
          ))}
        </div>
        <div className="relative sm:w-80"><FiSearch className="absolute left-3.5 top-4 text-(--text3)" size={16} /><input className="input pl-10!" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {state.loading ? <div className="flex justify-center py-16"><div className="spinner" /></div> : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-16 text-(--text2)"><FiInbox size={34} className="text-(--text3)" />{t("empty")}</div>
      ) : (
        <div className="space-y-6">
          {hot.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-(--danger)"><FiZap /> {t("attentionFirst")}</h2>
              <div className="space-y-3">{hot.map((a, i) => <ApplicationCard key={a.id} app={a} index={i} />)}</div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              {tab === "pending" && hot.length > 0 && <h2 className="mb-3 font-display text-lg font-semibold text-(--text2)">{t("others")}</h2>}
              <div className="space-y-3">{rest.map((a, i) => <ApplicationCard key={a.id} app={a} index={i + hot.length} />)}</div>
            </section>
          )}
        </div>
      )}
      <Link href="/applications/new" aria-label={t("newApp")} className="btn btn-primary fixed bottom-24 right-4 z-30 h-14! rounded-full! px-5! shadow-xl md:bottom-8 md:right-8"><FiPlus size={20} /> <span className="hidden sm:inline">{t("newApp")}</span></Link>
    </AppShell>
  );
}
