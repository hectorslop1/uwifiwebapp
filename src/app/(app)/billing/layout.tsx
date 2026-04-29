import { SectionTabs } from "@/src/components/ui/section-tabs";

const items = [
  { label: "Overview", href: "/billing" },
  { label: "Invoices", href: "/billing/invoices" },
  { label: "Payment methods", href: "/billing/payment-methods" },
  { label: "Transactions", href: "/billing/transactions" },
];

export default function BillingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-4">
      <SectionTabs items={items} />
      {children}
    </div>
  );
}
