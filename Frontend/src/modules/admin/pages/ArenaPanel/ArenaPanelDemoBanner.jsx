/** Shown on arena staff prototype screens until wired to arena-admin APIs. */
export default function ArenaPanelDemoBanner({ children }) {
  return (
    <div className="mb-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-[11px] font-semibold leading-snug text-amber-950 shadow-sm">
      <span className="font-black uppercase tracking-wide text-amber-800">Demo UI — </span>
      {children}
    </div>
  );
}
