import { ETSY_API_TRADEMARK_NOTICE } from "@/lib/legal/constants";

type Props = {
  className?: string;
  /** Smaller copy for dense footers */
  compact?: boolean;
};

/**
 * Etsy API Terms require this exact statement to appear prominently.
 */
export default function EtsyTrademarkNotice({
  className = "",
  compact = false,
}: Props) {
  return (
    <p
      className={`leading-relaxed text-slate-600 ${compact ? "text-[11px]" : "text-xs"} ${className}`}
    >
      {ETSY_API_TRADEMARK_NOTICE}
    </p>
  );
}
