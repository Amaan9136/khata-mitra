import Logo from "@/components/brand/Logo";
export default function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4">
      <div className="animate-float"><Logo size={44} /></div>
      <div className="spinner" />
    </div>
  );
}
