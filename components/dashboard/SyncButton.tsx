"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

type Status = "idle" | "syncing" | "success" | "error";

export default function SyncButton({
  shopId,
  label = "Sync Now",
  size = "md",
}: {
  shopId?: number;
  label?: string;
  size?: "sm" | "md";
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSync() {
    setStatus("syncing");
    setMessage("");

    try {
      const url = shopId
        ? `/api/shops/sync?shop_id=${shopId}`
        : "/api/shops/sync";

      const res = await fetch(url, { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        totalUpserted: number;
        results?: { shop_name: string; upserted: number; error?: string }[];
      };

      if (res.ok || res.status === 207) {
        setStatus(data.ok ? "success" : "error");
        setMessage(
          data.ok
            ? `${data.totalUpserted} order${data.totalUpserted !== 1 ? "s" : ""} synced`
            : data.results
                ?.filter((r) => r.error)
                .map((r) => `${r.shop_name}: ${r.error}`)
                .join("; ") ?? "Partial sync error"
        );
        router.refresh();
      } else {
        setStatus("error");
        setMessage("Sync failed. Check your connection.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error during sync.");
    }

    // Auto-reset after 4 seconds
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 4000);
  }

  const isSm = size === "sm";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={status === "syncing"}
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed
          ${isSm
            ? "px-3 py-1.5 text-xs"
            : "px-4 py-2 text-sm"
          }
          ${status === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : status === "error"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
      >
        {status === "syncing" ? (
          <RefreshCw className={`${isSm ? "h-3 w-3" : "h-4 w-4"} animate-spin`} />
        ) : status === "success" ? (
          <CheckCircle className={isSm ? "h-3 w-3" : "h-4 w-4"} />
        ) : status === "error" ? (
          <AlertCircle className={isSm ? "h-3 w-3" : "h-4 w-4"} />
        ) : (
          <RefreshCw className={isSm ? "h-3 w-3" : "h-4 w-4"} strokeWidth={2} />
        )}
        {status === "syncing" ? "Syncing…" : label}
      </button>

      {message && (
        <span
          className={`text-xs font-medium ${
            status === "success" ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
