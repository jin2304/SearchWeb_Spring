"use client";

import NextLink from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { buildBackendUrl } from "@/lib/config/backend";

interface LandingHeaderProps {
  activeSection?: string;
  isLoginPage?: boolean;
}

export function LandingHeader({ activeSection, isLoginPage = false }: LandingHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { name: "기능", href: isLoginPage ? "/#features" : "#features" },
    // Pricing is currently commented out in landing page, so we keep it hidden or consistent
    // { name: "가격", href: isLoginPage ? "/#pricing" : "#pricing" },
    { name: "문의하기", href: "https://relink.featurebase.app/en", isExternal: true },
  ];

  if (!mounted) return (
    <header className={`fixed w-full top-0 z-50 flex h-9 md:h-11 items-center justify-between whitespace-nowrap px-5 sm:px-8 lg:px-20 transition-all duration-300 ${
      isLoginPage 
        ? "bg-[#F5F3FF]/85 dark:bg-[#020617]/85 backdrop-blur-md lg:bg-transparent text-slate-800 dark:text-white" 
        : "border-b border-white/10 bg-black/95 backdrop-blur-md shadow-sm text-white"
    }`}>
      <NextLink href="/" className="flex items-center space-x-2 group transition-opacity select-none">
        <Image src="/relink_logo.png" alt="ReLink" width={24} height={24} className="object-contain group-hover:scale-110 transition-transform" />
        <span className={`text-xl font-bold tracking-tight uppercase sm:normal-case ${isLoginPage ? 'text-slate-900 dark:text-white' : 'text-white'}`}>ReLink</span>
      </NextLink>
    </header>
  );

  return (
    <>
      <header className={`fixed w-full top-0 z-50 flex h-9 md:h-11 items-center justify-between whitespace-nowrap px-5 sm:px-8 lg:px-20 transition-all duration-300 ${
        isLoginPage 
          ? "bg-[#F5F3FF]/85 dark:bg-[#020617]/85 backdrop-blur-md lg:bg-transparent text-slate-800 dark:text-white" 
          : "border-b border-white/10 bg-black/95 backdrop-blur-md shadow-sm text-white"
      }`}>
        {/* Logo */}
        <NextLink href="/" className="flex items-center space-x-2 group transition-opacity select-none" onClick={closeMenu}>
          <Image src="/relink_logo.png" alt="ReLink" width={24} height={24} className="object-contain group-hover:scale-110 transition-transform" />
          <span className={`text-xl font-bold tracking-tight ${isLoginPage ? 'text-slate-900 dark:text-white' : 'text-white'}`}>ReLink</span>
        </NextLink>

        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                className={`text-[13px] font-medium transition-colors ${
                  isLoginPage 
                    ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white' 
                    : 'text-slate-300 hover:text-white'
                }`}
                href={link.href}
                {...(link.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.name}
              </a>
            ))}
            {!isLoginPage && (
              <NextLink href="/login" className="text-slate-300 hover:text-white text-[13px] font-medium transition-colors">
                로그인
              </NextLink>
            )}
          </nav>
          
          <div className="flex items-center gap-2 ml-4">
            {/* Theme Toggle */}
            <button
              type="button"
              className={`flex items-center justify-center p-1.5 md:p-2 rounded-full transition-colors ${
                isLoginPage 
                  ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="테마 전환"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden flex items-center p-1.5 md:p-2 rounded-full transition-all active:scale-90 ${
                isLoginPage 
                  ? 'text-slate-800 dark:text-white hover:bg-slate-200/50 dark:hover:bg-white/10' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={toggleMenu}
              aria-label="메뉴 열기"
            >
              <span className="material-symbols-outlined !text-[20px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[250px] bg-[#0a0a0b] border-l border-white/10 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex flex-col h-full p-5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <Image src="/relink_logo.png" alt="ReLink" width={20} height={20} className="object-contain" />
                    <span className="text-base font-bold tracking-tight text-white">ReLink</span>
                  </div>
                  <button 
                    onClick={closeMenu}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center px-3 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-[14px] font-medium group"
                      {...(link.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span>{link.name}</span>
                      <span className="material-symbols-outlined !text-[18px] ml-auto text-violet-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">chevron_right</span>
                    </a>
                  ))}
                  
                  {!isLoginPage && (
                    <NextLink
                      href="/login"
                      onClick={closeMenu}
                      className="mt-4 flex items-center justify-center py-2.5 bg-[linear-gradient(135deg,#6d28d9,#8b5cf6)] text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all"
                    >
                      로그인
                    </NextLink>
                  )}
                </nav>

                <div className="mt-auto pt-5 border-t border-white/5">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-2xl">
                    <span className="text-[13px] text-slate-400 font-medium">테마 설정</span>
                    <button
                      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                      className="flex h-8 w-15 items-center rounded-full bg-slate-800 p-1 transition-colors relative"
                    >
                      <motion.div 
                        animate={{ x: resolvedTheme === 'dark' ? 28 : 0 }}
                        className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-sm"
                      >
                        <span className="material-symbols-outlined !text-[14px]">
                          {resolvedTheme === 'dark' ? 'dark_mode' : 'light_mode'}
                        </span>
                      </motion.div>
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-[10px] text-slate-600 font-medium tracking-widest">© 2026 ReLink Inc.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
