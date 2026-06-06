"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useUIStore } from "@/lib/store/uiStore";

import { MobileBottomNavBar } from "@/components/layout/MobileBottomNavBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login";
  
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);

  if (isLandingPage) {
    return (
      <>
        {children}
        <MobileBottomNavBar />
      </>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden tablet-lg:flex" />
      
      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-drawer-backdrop flex tablet-lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => toggleMobileSidebar(false)}
          />
          {/* Drawer Sidebar */}
          <Sidebar 
            className="relative z-drawer w-[210px] flex-shrink-0 h-full shadow-2xl animate-in slide-in-from-left duration-300" 
            onClose={() => toggleMobileSidebar(false)}
          />
        </div>
      )}

      <main className="flex-grow flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark w-full min-w-0">
        <Header />
        <div className="flex-grow overflow-hidden">
          {children}
        </div>
      </main>

      {/* Global Mobile Bottom Navigation Bar */}
      <MobileBottomNavBar />
    </div>
  );
}
