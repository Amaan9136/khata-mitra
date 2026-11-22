"use client";
import { useT } from "@/store/useLangStore";
const CLS = { open: "badge-teal", approved: "badge-success", rejected: "badge-danger", returned: "badge-warning" };
export default function StatusBadge({ status }) {
  const { t } = useT();
  return <span className={`badge ${CLS[status] || "badge-neutral"}`}>{t(`status.${status}`)}</span>;
}
