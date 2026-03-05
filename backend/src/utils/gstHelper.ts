export type GSTSlab = 0 | 5 | 12 | 18 | 28;

export interface GSTBreakdown {
  baseAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
}

// Single item ka GST calculate karo
export const calculateGST = (
  baseAmount: number,
  gstRate: GSTSlab,
  isInterState: boolean = false
): GSTBreakdown => {
  const totalTax = (baseAmount * gstRate) / 100;

  const cgst = isInterState ? 0 : totalTax / 2;
  const sgst = isInterState ? 0 : totalTax / 2;
  const igst = isInterState ? totalTax : 0;

  return {
    baseAmount: parseFloat(baseAmount.toFixed(2)),
    gstRate,
    cgst: parseFloat(cgst.toFixed(2)),
    sgst: parseFloat(sgst.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalAmount: parseFloat((baseAmount + totalTax).toFixed(2)),
  };
};

// Full bill ka GST calculate karo (multiple items)
export const calculateBillGST = (
  items: { price: number; quantity: number; gstRate: GSTSlab }[],
  isInterState: boolean = false
) => {
  let totalBase = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalTax = 0;

  const breakdown = items.map((item) => {
    const baseAmount = item.price * item.quantity;
    const gst = calculateGST(baseAmount, item.gstRate, isInterState);

    totalBase += gst.baseAmount;
    totalCGST += gst.cgst;
    totalSGST += gst.sgst;
    totalIGST += gst.igst;
    totalTax += gst.totalTax;

    return gst;
  });

  return {
    breakdown,
    summary: {
      totalBase: parseFloat(totalBase.toFixed(2)),
      totalCGST: parseFloat(totalCGST.toFixed(2)),
      totalSGST: parseFloat(totalSGST.toFixed(2)),
      totalIGST: parseFloat(totalIGST.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      grandTotal: parseFloat((totalBase + totalTax).toFixed(2)),
    },
  };
};
