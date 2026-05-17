import { Info, Key, Shield } from "lucide-react";

export const metadata = {
  title: "Settings — SellerSyncHub Dashboard",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-0">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Application configuration and API status
        </p>
      </div>

      <div className="px-6 py-6 max-w-2xl flex flex-col gap-6">
        {/* API Status */}
        <Section
          icon={<Key className="h-5 w-5 text-indigo-600" />}
          title="Etsy API"
          description="Personal access — up to 5 connected shops"
        >
          <div className="space-y-3">
            <Row label="Access Level" value="Personal (Development)" />
            <Row label="Scopes" value="shops_r · transactions_r · listings_r" />
            <Row label="Token Refresh" value="Automatic on 401" />
          </div>
        </Section>

        {/* Compliance */}
        <Section
          icon={<Shield className="h-5 w-5 text-indigo-600" />}
          title="Compliance"
          description="Etsy API Terms compliance status"
        >
          <div className="space-y-3">
            <Row label="Trademark Notice" value="Displayed in footer ✓" />
            <Row label="Buyer Email" value="Not requested (pending approval)" />
            <Row label="Data Caching" value="Orders cached in Supabase ✓" />
          </div>
        </Section>

        {/* Info notice */}
        <div className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <p className="text-xs text-indigo-700 leading-relaxed">
            Full settings management (webhooks, notification preferences, team
            access) will be available after commercial access approval. Focus
            now is on building a working demo.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}
