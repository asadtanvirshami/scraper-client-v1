import type { Metadata } from "next";
import AdminBillingManagement from "@/features/admin/billing-management";

export const metadata: Metadata = {
  title: "Billing Management",
};

export default function AdminBillingPage() {
  return <AdminBillingManagement />;
}
