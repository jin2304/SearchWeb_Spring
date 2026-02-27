"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login";

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark w-full">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
