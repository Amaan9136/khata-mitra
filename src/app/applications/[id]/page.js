"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiCornerUpLeft, FiPhone } from "react-icons/fi";
import AppShell from "@/components/layout/AppShell";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/app/StatusBadge";
import ReasonChips from "@/components/app/ReasonChips";
import Stepper from "@/components/app/Stepper";
import SummaryCard from "@/components/app/SummaryCard";
import DocsPanel from "@/components/app/DocsPanel";
import IntakePanel from "@/components/app/IntakePanel";
import VerificationPanel from "@/components/app/VerificationPanel";
import InspectionPanel from "@/components/app/InspectionPanel";
import DecisionPanel from "@/components/app/DecisionPanel";
import DecisionDialog from "@/components/app/DecisionDialog";
import Timeline from "@/components/app/Timeline";
import { useAi } from "@/components/app/useAi";
import { apiGet } from "@/lib/apiClient";
import { useT } from "@/store/useLangStore";
import { fmtDate } from "@/lib/i18n";
const Row = ({ k, v }) => (v ? <div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-wide text-(--text3)">{k}</div><div className="wrap-break-word text-base font-medium text-(--text1)">{v}</div></div> : null);
export default function ApplicationPage() {
  const { id } = useParams();
  const { t, te, lang } = useT();
  const [app, setApp] = useState(null);
  const [view, setView] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [failed, setFailed] = useState(false);
  const onApp = useCallback((a, advanced) => {
    setApp(a);
    if (advanced) setView(null);
  }, []);
  const ai = useAi(id, onApp);
  useEffect(() => {
    apiGet(`/api/applications/${id}`).then((d) => setApp(d.application)).catch((e) => { setFailed(true); toast.error(te(e.code)); });
  }, [id, te]);
  if (failed) return <AppShell title="–" back="/dashboard"><div className="card p-10 text-center"><Link className="btn btn-primary" href="/dashboard">{t("back")}</Link></div></AppShell>;
  if (!app) return <AppShell title="…" back="/dashboard"><PageLoader /></AppShell>;
  const open = app.status === "open";
  const current = view ?? (open ? app.step : 3);
  const readOnly = !open || current < app.step;
  const p = app.property || {};
  const left = app.priority?.daysLeft;
  const clock = !open ? null : left < 0 ? t("clockOver", { n: -left }) : left === 0 ? t("clockToday") : t("clockLeft", { n: left });
  const panel = [
    <IntakePanel key={`${app.status}${app.step}`} app={app} readOnly={readOnly} onApp={onApp} />,
    <VerificationPanel key={`${app.status}${app.step}`} app={app} ai={ai} readOnly={readOnly} onApp={onApp} />,
    <InspectionPanel key={`${app.status}${app.step}`} app={app} ai={ai} readOnly={readOnly} onApp={onApp} />,
    <DecisionPanel key={`${app.status}${app.step}`} app={app} onApp={onApp} onDecide={setDialog} />
  ][current];
  return (
    <AppShell title={app.applicationNo} back="/dashboard">
      <div className="card mb-5 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={app.status} /><span className="badge badge-neutral">{t(`type.${app.mutationType}`)}</span>
          {clock && <span className={`badge ${left < 0 ? "badge-danger" : left <= 5 ? "badge-warning" : "badge-teal"}`}>{clock}</span>}
          {open && app.step < 3 && <button type="button" className="btn btn-secondary btn-sm ml-auto" onClick={() => setDialog("return")}><FiCornerUpLeft size={15} /> {t("dec.returnEarly")}</button>}
        </div>
        {open && app.priority?.reasons.length > 0 && <div className="mb-4"><ReasonChips reasons={app.priority.reasons} /></div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Row k={t("applicant")} v={`${app.applicant?.name}${app.applicant?.relation ? ` (${app.applicant.relation})` : ""}`} />
          <Row k={t(`seller.${app.mutationType}`)} v={app.seller?.name} />
          <Row k={t("surveyNo")} v={p.surveyNo} />
          <Row k={t("extent")} v={p.extent} />
          <Row k={`${t("village")} / ${t("hobli")}`} v={`${p.village}, ${p.hobli}`} />
          <Row k={t("taluk")} v={p.taluk} />
          <Row k={t(`ref.${app.mutationType}`)} v={app.transaction?.refNo ? `${app.transaction.refNo}${app.transaction.date ? ` · ${fmtDate(app.transaction.date, lang)}` : ""}` : ""} />
          <Row k={`${t("received")} → ${t("due")}`} v={`${fmtDate(app.receivedAt, lang)} → ${fmtDate(app.dueAt, lang)}`} />
        </div>
        {app.applicant?.phone && <a href={`tel:${app.applicant.phone}`} className="btn btn-secondary btn-sm mt-4"><FiPhone size={15} /> {app.applicant.phone}</a>}
      </div>
      <Stepper app={app} view={current} onView={(i) => setView(i)} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <SummaryCard app={app} ai={ai} />
          {panel}
          <DocsPanel app={app} ai={ai} onApp={onApp} />
        </div>
        <div className="min-w-0"><Timeline history={app.history} /></div>
      </div>
      {dialog && <DecisionDialog app={app} outcome={dialog} ai={ai} onClose={() => setDialog(null)} onDone={(a) => { setApp(a); setView(null); setDialog(null); toast.success(t(`dec.final.${a.status}`)); }} />}
    </AppShell>
  );
}
