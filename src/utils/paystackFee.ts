// Paystack deducts its processing fee from the amount actually charged, so
// simply adding `net * rate` on top undercharges — the merchant ends up
// receiving less than the intended net amount. Gross-up the charge instead:
// grossAmount = netAmount / (1 - feeRate)
// This guarantees netAmount = grossAmount - (grossAmount * feeRate).

export const PAYSTACK_FEE_RATE = Number(process.env.NEXT_PUBLIC_PAYSTACK_FEE_RATE) || 0.0195;

export interface PaystackGrossUp {
  /** Amount to actually charge the customer, in GHS, rounded to 2dp. */
  grossAmount: number;
  /** Processing fee portion of the gross amount, in GHS, rounded to 2dp. */
  fee: number;
  /** Gross amount converted to pesewas (Paystack's smallest currency unit). */
  amountInPesewas: number;
}

/**
 * Given the net amount you need to receive (in GHS), returns the gross
 * amount to charge via Paystack so that after its feeRate is deducted, you
 * net the original amount. All math is done in integer pesewas to avoid
 * floating-point rounding errors.
 */
export function calculatePaystackGrossUp(
  netAmount: number,
  feeRate: number = PAYSTACK_FEE_RATE
): PaystackGrossUp {
  const netPesewas = Math.round(netAmount * 100);
  const grossPesewas = Math.round(netPesewas / (1 - feeRate));
  const feePesewas = grossPesewas - netPesewas;

  return {
    grossAmount: grossPesewas / 100,
    fee: feePesewas / 100,
    amountInPesewas: grossPesewas,
  };
}
