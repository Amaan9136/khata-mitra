"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiFileText, FiImage, FiPlus, FiCamera, FiEye, FiEyeOff } from "react-icons/fi";
import AiButton from "./AiButton";
import { apiGet, apiPost } from "@/lib/apiClient";
import { fileToDataUrl } from "@/lib/image";
import { DOC_KINDS } from "@/lib/process";
import { useT } from "@/store/useLangStore";
const EX = ["surveyNo", "extent", "date", "registrationNo", "amount", "village"];
function Doc({ app, doc, ai }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(null);
  const ex = doc.extracted;
  const toggle = async () => {
    if (!open && !full) setFull(await apiGet(`/api/applications/${app.id}/documents/${doc.id}`).catch(() => ({})));
    setOpen(!open);
  };
  return (
    <li className="rounded-2xl border border-(--border) bg-white/70 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-light) text-(--accent)">{doc.hasImage ? <FiImage /> : <FiFileText />}</span>
        <div className="min-w-0 flex-1"><div className="font-semibold">{t(`doc.${doc.kind}`)}</div>{doc.name && <div className="truncate text-sm text-(--text2)">{doc.name}</div>}</div>
        <button type="button" onClick={toggle} className="btn btn-secondary btn-sm">{open ? <FiEyeOff size={15} /> : <FiEye size={15} />}{open ? t("docs.hide") : t("docs.view")}</button>
        {app.status === "open" && <AiButton small busy={ai.busy === `extract${doc.id}`} onClick={() => ai.run("extract", { docId: doc.id })}>{t("docs.extract")}</AiButton>}
      </div>
      {open && full && (
        <div className="mt-3 max-h-72 overflow-auto rounded-xl bg-(--bg3) p-3 text-sm">
          {full.imageData && <img src={full.imageData} alt={doc.name || doc.kind} className="mb-2 max-h-64 rounded-lg" />}
          {full.text && <pre className="whitespace-pre-wrap font-[inherit] text-(--text1)">{full.text}</pre>}
        </div>
      )}
      {ex && (
        <div className="mt-3 rounded-xl bg-(--accent-light) p-3 text-sm">
          <div className="mb-2 font-semibold text-(--accent-dark)">{t("docs.extracted")}</div>
          <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {ex.names?.length > 0 && <div className="sm:col-span-2"><dt className="inline text-(--text2)">{t("ex.names")}: </dt><dd className="inline font-medium">{ex.names.join(", ")}</dd></div>}
            {EX.filter((k) => ex[k]).map((k) => <div key={k}><dt className="inline text-(--text2)">{t(`ex.${k}`)}: </dt><dd className="inline font-medium">{ex[k]}</dd></div>)}
            {ex.notes && <div className="sm:col-span-2"><dt className="inline text-(--text2)">{t("ex.notes")}: </dt><dd className="inline font-medium">{ex.notes}</dd></div>}
          </dl>
        </div>
      )}
    </li>
  );
}
export default function DocsPanel({ app, ai, onApp }) {
  const { t, te } = useT();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ kind: DOC_KINDS[0], name: "", text: "", imageData: "" });
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (f) fileToDataUrl(f).then((imageData) => setForm((s) => ({ ...s, imageData }))).catch(() => toast.error(t("errGeneric")));
  };
  const submit = async () => {
    setBusy(true);
    try {
      const d = await apiPost(`/api/applications/${app.id}/documents`, form);
      onApp(d.application);
      setForm({ kind: DOC_KINDS[0], name: "", text: "", imageData: "" });
      setAdding(false);
    } catch (e) {
      toast.error(te(e.code));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="card mt-5 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{t("docs.title")} · {app.documents.length}</h2>
        {app.status === "open" && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdding(!adding)}><FiPlus size={16} /> {t("docs.add")}</button>}
      </div>
      {adding && (
        <div className="mb-4 rounded-2xl border border-(--accent-glow) bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">{t("docs.kind")}</label><select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{DOC_KINDS.map((k) => <option key={k} value={k}>{t(`doc.${k}`)}</option>)}</select></div>
            <div><label className="label">{t("docs.name")}</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} /></div>
          </div>
          <div className="form-group mt-3"><label className="label">{t("docs.text")}</label><textarea className="input" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} maxLength={6000} /></div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn btn-secondary cursor-pointer"><FiCamera size={17} /> {form.imageData ? t("docs.photoReady") : t("docs.photo")}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} /></label>
            {form.imageData && <img src={form.imageData} alt="" className="h-12 rounded-lg" />}
            <button type="button" className="btn btn-primary ml-auto" disabled={busy || (!form.text.trim() && !form.imageData)} onClick={submit}>{t("docs.submit")}</button>
          </div>
        </div>
      )}
      {app.documents.length === 0 ? <p className="text-sm text-(--text3)">{t("docs.none")}</p> : <ul className="space-y-3">{app.documents.map((d) => <Doc key={d.id} app={app} doc={d} ai={ai} />)}</ul>}
    </div>
  );
}
