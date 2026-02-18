import type { ReactNode } from "react";
import { Suspense } from "react";
import { requireUserOrRedirect } from "@/server/security/auth";
import AcademyLayoutClient from "@/components/academy/AcademyLayoutClient";

export default async function AcademyLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUserOrRedirect();

  return (
    <Suspense>
      <AcademyLayoutClient
        user={{
          role: user.role,
          email: user.email,
          contact: user.contact
            ? {
                firstName: user.contact.firstName,
                lastName: user.contact.lastName,
              }
            : null,
        }}
      >
        {children}
      </AcademyLayoutClient>
    </Suspense>
  );
}
