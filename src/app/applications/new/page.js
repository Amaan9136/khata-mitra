"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { apiPost } from "@/lib/apiClient";
import { MUTATION_TYPES } from "@/lib/process";
import { useT } from "@/store/useLangStore";
const empty = { mutationType: "sale", applicantName: "", phone: "", relation: "", sellerName: "", surveyNo: "", extent: "", village: "", hobli: "", taluk: "", refNo: "", refDate: "" };
export default function NewApplicationPage() {
  const { t, te } = useT();
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const field = (k, label, props = {}) => <div className="form-group"><label className="label" htmlFor={k}>{label}</label><input id={k} className="input" value={f[k]} onChange={set(k)} required={props.required !== false} {...props} /></div>;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await apiPost("/api/applications", { mutationType: f.mutationType, applicant: { name: f.applicantName, phone: f.phone, relation: f.relation }, seller: { name: f.sellerName }, property: { surveyNo: f.surveyNo, village: f.village, hobli: f.hobli, taluk: f.taluk, extent: f.extent }, transaction: { refNo: f.refNo, date: f.refDate || undefined } });
      toast.success(t("new.created"));
      router.push(`/applications/${d.application.id}`);
    } catch (err) {
      toast.error(te(err.code));
      setBusy(false);
    }
  };
  return (
    <AppShell title={t("new.title")} back="/dashboard">
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
        <p className="text-sm text-(--text2)">{t("new.hint")}</p>
        <div className="card p-5">
          <div className="label">{t("new.type")}</div>
          <div className="grid grid-cols-2 gap-2">
            {MUTATION_TYPES.map((k) => <button key={k} type="button" onClick={() => setF({ ...f, mutationType: k })} className={`min-h-14 cursor-pointer rounded-xl border px-3 text-base font-semibold transition ${f.mutationType === k ? "border-(--accent) bg-(--accent-light) text-(--accent-dark)" : "border-(--border) bg-white/70 text-(--text2)"}`}>{t(`type.${k}`)}</button>)}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("new.applicantSection")}</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field("applicantName", t("applicant"), { autoComplete: "off", maxLength: 100 })}
            {field("phone", t("phone"), { inputMode: "numeric", pattern: "[0-9]{10}", maxLength: 10 })}
            {field("relation", t("relation"), { required: false, maxLength: 60 })}
            {field("sellerName", t(`new.sellerName.${f.mutationType}`), { maxLength: 100 })}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("new.propertySection")}</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field("surveyNo", t("surveyNo"), { maxLength: 30 })}
            {field("extent", t("extent"), { maxLength: 60, placeholder: "1 Acre 10 Guntas" })}
            {field("village", t("village"), { maxLength: 60 })}
            {field("hobli", t("hobli"), { maxLength: 60 })}
            {field("taluk", t("taluk"), { maxLength: 60 })}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("new.txSection")}</h2>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {field("refNo", t(`ref.${f.mutationType}`), { required: false, maxLength: 60 })}
            {field("refDate", t(`refDate.${f.mutationType}`), { required: false, type: "date" })}
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={busy}>{busy ? <span className="spinner spinner-sm" /> : null} {t("new.submit")}</button>
      </form>
    </AppShell>
  );
}
