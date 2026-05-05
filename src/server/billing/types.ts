export type BillingPeriod = {
  dueDate: string;
  currentBillingPeriod: {
    startDate: string;
    endDate: string;
    balance: number | null;
  };
};

export type PaymentMethod = {
  id: number;
  customerId: number;
  cardHolder: string;
  last4Digits: string;
  expirationMonth: string;
  expirationYear: string;
  cardBrand: string;
  token: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BillingInvoice = {
  invoiceId: number;
  invoiceNumber: string;
  customerId: number;
  createdAt: string;
  dueDate: string;
  balance: number;
  closingBalance: number;
  discount: number;
  uPoints: number;
  paymentId: number | null;
  services: Array<Record<string, unknown>>;
  currentBillingPeriod: Record<string, unknown>;
  fileUrl: string | null;
  fileName: string | null;
  title: string | null;
  metadataJson: Record<string, unknown> | null;
  totalAmount: number;
  status: "Paid" | "Pending";
};

export type BillingTransaction = {
  id: string;
  invoiceId: number;
  invoiceNumber: string;
  createdAt: string;
  transactionType: "Automatic payment" | "Invoice payment" | "Pending invoice";
  amount: number;
  status: "Settled" | "Pending";
  methodLabel: string;
};

export type BillingOverviewData = {
  billingPeriod: BillingPeriod | null;
  balance: number;
  amountDue: number;
  autoPayEnabled: boolean | null;
  paymentMethods: PaymentMethod[];
  invoices: BillingInvoice[];
  transactions: BillingTransaction[];
};
