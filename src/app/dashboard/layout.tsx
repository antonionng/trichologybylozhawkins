import type { ReactNode } from "react";
import { requireUserOrRedirect } from "@/server/security/auth";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUserOrRedirect();

  return (
    <DashboardLayoutClient 
      user={{
        role: user.role,
        email: user.email,
        contact: user.contact ? {
          firstName: user.contact.firstName,
          lastName: user.contact.lastName,
        } : null
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
