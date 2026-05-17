export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-20 rounded bg-slate-200" />
          <div className="h-3 w-36 rounded bg-slate-200" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-slate-200" />
      </div>

      <div className="px-6 py-6 flex flex-col gap-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-slate-200" />
              <div className="mt-3 h-7 w-10 rounded bg-slate-200" />
              <div className="mt-1 h-3 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 h-10" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100">
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-3 w-40 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-200 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
