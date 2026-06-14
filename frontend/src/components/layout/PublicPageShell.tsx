import type { ReactNode } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full overflow-y-auto bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <LandingHeader surface="light" />
      <main className="min-h-[calc(100vh-2.75rem)] pt-11">{children}</main>
      <PublicFooter />
    </div>
  );
}
