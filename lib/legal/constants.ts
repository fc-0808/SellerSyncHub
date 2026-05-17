/**
 * Legal document versions — bump when you materially change /privacy or
 * /application-terms so consent audit trail stays accurate.
 */
export const PRIVACY_POLICY_VERSION = "2026-05-16";
export const APPLICATION_TERMS_VERSION = "2026-05-16";

/**
 * Required verbatim by the Etsy API Terms of Use §1 (last updated Jun 16 2025).
 *
 * AUTHORITATIVE SOURCE — API Terms of Use §1 (binding legal document):
 *   "The term 'Etsy' is a trademark of Etsy, Inc. This Application uses Etsy's API,
 *    but is not endorsed or certified by Etsy."
 *
 * NOTE: The developer docs commercial-access checklist uses slightly different wording
 * ("the Etsy API" / "by Etsy, Inc."). We use the API Terms wording which is the
 * authoritative legal document and supersedes any summary in the developer docs.
 *
 * Must appear PROMINENTLY in: footer, /application-terms, /integrations/etsy, waitlist consent.
 */
export const ETSY_API_TRADEMARK_NOTICE =
  "The term 'Etsy' is a trademark of Etsy, Inc. This Application uses Etsy's API, but is not endorsed or certified by Etsy.";

export const APPLICATION_DEVELOPER_LEGAL_NAME = "SellerSyncHub";
