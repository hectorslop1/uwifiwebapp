import { redirect } from "next/navigation";

export default function BillingTransactionsPage() {
  redirect("/billing/invoices");
}
