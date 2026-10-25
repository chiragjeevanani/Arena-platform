/**
 * Oman VAT. Keep in step with the backend's VAT_PERCENT (default 5) — the server computes
 * the amounts actually charged; this is what the app displays.
 */
export const VAT_PERCENT = 5;
export const VAT_RATE = VAT_PERCENT / 100;

/**
 * Customer prices include VAT. Splits a VAT-inclusive amount into its net part and the
 * VAT it contains (OMR, 3 decimals): 5.000 → { net: 4.762, vat: 0.238 }.
 */
export function splitInclusiveVat(gross, percent = VAT_PERCENT) {
  const g = Math.round((Number(gross) || 0) * 1000) / 1000;
  const vat = Math.round((g * percent / (100 + percent)) * 1000) / 1000;
  return { net: Math.round((g - vat) * 1000) / 1000, vat, gross: g };
}
