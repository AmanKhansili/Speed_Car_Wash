export interface InvoiceData {
  bookingId: string;
  paymentId?: string;
  customerName?: string;
  phone?: string;
  serviceName: string;
  vehicleName?: string;
  registrationNumber?: string;
  bookingDate: string;
  address: string;
  amount: number;
  discount?: number;
}

export interface InvoiceCalculatedSummary {
  invoiceRef: string;
  subTotal: number;
  discount: number;
  gst: number;
  platformFee: number;
  grandTotal: number;
}

/**
 * Pure JavaScript Tax & Bill Breakdown Calculation
 * (No native libraries required)
 */
export const calculateInvoiceBreakdown = (
  amount: number,
  discount: number = 0,
  bookingId: string = "",
): InvoiceCalculatedSummary => {
  const subTotal = amount;
  const taxableAmount = Math.max(0, subTotal - discount);
  const gst = Math.round(taxableAmount * 0.18);
  const platformFee = 49;
  const grandTotal = taxableAmount + gst + platformFee;

  return {
    invoiceRef: `#${bookingId ? bookingId.slice(0, 8).toUpperCase() : "REC-001"}`,
    subTotal,
    discount,
    gst,
    platformFee,
    grandTotal,
  };
};
