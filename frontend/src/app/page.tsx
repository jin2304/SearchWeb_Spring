"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildBackendUrl } from "@/lib/config/backend";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { LandingHeader } from "@/components/layout/LandingHeader";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const scrollTop =
        containerRef.current?.scrollTop ??
        window.scrollY ??
        document.documentElement.scrollTop ??
        document.body.scrollTop ??
        0;

      if (scrollTop > 240) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    handleScroll();

    const scrollContainer = containerRef.current;

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = containerRef.current;

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/my-links");
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen min-h-screen w-full w-screen flex-col overflow-x-hidden overflow-y-auto text-text-main font-sans selection:bg-primary/20 bg-background-light dark:bg-background-dark"
    >
      <LandingHeader />

      <main className="flex-grow">
        <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 px-6 lg:px-20 bg-background-light dark:bg-background-dark transition-colors duration-300">
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-primary/5 dark:bg-violet-600/15 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-primary-light/40 dark:bg-violet-900/40 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4"></div>
          <div className="w-full mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row justify-between gap-8 lg:items-center">
              {/* Left Column: Text & Features */}
              <div className="flex flex-col gap-6 lg:w-[50%] lg:pr-10">
                <div className="space-y-4 text-left">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-500/20 dark:border-white/10 bg-violet-500/10 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 shadow-[0_4px_15px_-3px_rgba(139,92,246,0.12)] dark:shadow-none transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-500/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 dark:bg-violet-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
                    </span>
                    <span className="tracking-tight">지금 가장 스마트한 북마크, ReLink 베타서비스</span>
                  </div>
                  <h1 className="text-text-main dark:text-white text-2xl sm:text-3xl font-black leading-[1.2] tracking-tight lg:text-4xl pt-2">
                    흩어진 링크에서,<br/>
                    <span className="bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] bg-clip-text text-transparent">가치 있는 지식을 발견하세요</span>
                  </h1>
                  <p className="text-text-sub dark:text-white/60 text-sm font-medium leading-relaxed tracking-tight max-w-lg opacity-80">
                    저장하고, 태그하고, 다시 활용하세요.<br/>
                    ReLink가 당신의 지식 관리를 돕습니다.<br/>
                    단순한 저장을 넘어선 지식 베이스를 구축하세요.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-0">
                  <a 
                    href={isAuthenticated ? "/my-links" : "/login"}
                    onClick={handleStartClick}
                    className="flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:brightness-110 text-white text-sm font-bold h-11 px-6 rounded-lg transition-all shadow-lg shadow-violet-500/25 border-t border-white/20 whitespace-nowrap"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white p-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    계정으로 바로 시작하기
                  </a>
                </div>

                <div className="flex flex-col gap-5 border-t border-slate-100 dark:border-white/10 pt-8 mt-4 relative z-10">
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-violet-500/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-violet-500/20 text-primary dark:text-violet-300 transition-all duration-500 group-hover:bg-slate-50 dark:group-hover:bg-violet-500/30 group-hover:shadow-[0_8px_25px_rgba(139,92,246,0.15)] group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-violet-400">
                      <span className="material-symbols-outlined text-[24px] transition-all duration-500 group-hover:text-primary dark:group-hover:text-violet-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]">auto_awesome</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main dark:text-white text-[15px] tracking-tight mb-0.5 transition-colors group-hover:text-primary dark:group-hover:text-violet-400">AI 자동 태깅</h4>
                      <p className="text-sm font-medium tracking-tight text-text-sub dark:text-white/60 opacity-80">문서 내용 분석을 통한 지능형 자동 카테고리 분류</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-violet-500/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-violet-500/20 text-primary dark:text-violet-300 transition-all duration-500 group-hover:bg-slate-50 dark:group-hover:bg-violet-500/30 group-hover:shadow-[0_8px_25px_rgba(139,92,246,0.15)] group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-violet-400">
                      <span className="material-symbols-outlined text-[24px] transition-all duration-500 group-hover:text-primary dark:group-hover:text-violet-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]">folder_open</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main dark:text-white text-[15px] tracking-tight mb-0.5 transition-colors group-hover:text-primary dark:group-hover:text-violet-400">스마트 폴더 추천</h4>
                      <p className="text-sm font-medium tracking-tight text-text-sub dark:text-white/60 opacity-80">프로젝트 및 팀별 문서를 최적의 구조로 스마트하게 정리</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-violet-500/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-violet-500/20 text-primary dark:text-violet-300 transition-all duration-500 group-hover:bg-slate-50 dark:group-hover:bg-violet-500/30 group-hover:shadow-[0_8px_25px_rgba(139,92,246,0.15)] group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-violet-400">
                      <span className="material-symbols-outlined text-[24px] transition-all duration-500 group-hover:text-primary dark:group-hover:text-violet-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]">bolt</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main dark:text-white text-[15px] tracking-tight mb-0.5 transition-colors group-hover:text-primary dark:group-hover:text-violet-400">초고속 검색</h4>
                      <p className="text-sm font-medium tracking-tight text-text-sub dark:text-white/60 opacity-80">수만 개의 자료 속에서 원하는 정보를 찾아내는 0.1초 검색</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Animated Card Illustration */}
              <div className="lg:w-[50%] flex justify-center lg:justify-end mt-12 lg:mt-0">
                <div className="relative w-full max-w-2xl py-12 sm:py-20 flex justify-center items-center">
                  {/* Background decoration */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-linear-to-br from-primary/10 to-transparent dark:from-violet-600/10 rounded-full blur-3xl -z-10"></div>
                  
                  <div className="flex items-center -space-x-12 sm:-space-x-16 relative z-10 scale-90 sm:scale-100">
                    {/* Left Card */}
                    <div className="h-32 w-44 sm:h-40 sm:w-56 rounded-xl border border-slate-100 dark:border-violet-500/20 bg-white/95 dark:bg-slate-900/90 shadow-[0_0_40px_rgba(139,92,246,0.2)] dark:shadow-violet-900/10 backdrop-blur-md p-4 flex flex-col gap-3 rotate-[-8deg] transition-all hover:rotate-0 hover:scale-110 duration-500 group z-10 hover:border-violet-300 dark:hover:border-violet-500/40 group-hover:shadow-[0_0_80px_rgba(139,92,246,0.4)]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20 group-hover:animate-pulse">
                          <span className="material-symbols-outlined text-lg">language</span>
                        </div>
                        <div className="h-2 w-20 rounded bg-slate-100 dark:bg-slate-700"></div>
                      </div>
                      <div className="space-y-1.5 mt-1">
                        <div className="h-1.5 w-full rounded bg-slate-50 dark:bg-slate-800"></div>
                        <div className="h-1.5 w-2/3 rounded bg-slate-50 dark:bg-slate-800"></div>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100/50 dark:border-white/5 text-[9px] text-sky-600/70 dark:text-sky-400/70 font-medium">Technical</span>
                        <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[9px] text-slate-400 dark:text-slate-400">Tutorial</span>
                      </div>
                    </div>

                    {/* Center Card (Featured/AI) */}
                    <div className="h-40 w-52 sm:h-48 sm:w-64 rounded-2xl border border-violet-100 dark:border-violet-500/40 bg-white dark:bg-slate-950 shadow-[0_0_60px_rgba(139,92,246,0.3)] dark:shadow-violet-900/60 p-4 flex flex-col gap-3 z-20 scale-110 relative group transition-all duration-500 hover:scale-125 hover:border-violet-300 hover:shadow-[0_0_100px_rgba(139,92,246,0.5)]">

                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/40 border border-violet-100 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl">bookmarks</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700"></div>
                          <div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="h-1.5 w-full rounded bg-slate-100 dark:bg-slate-800/50"></div>
                        <div className="h-1.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800/50"></div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          <div className="px-2 py-1 rounded-md bg-violet-100/50 dark:bg-violet-500/10 text-[9px] font-bold text-violet-700 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/20">AI</div>
                          <div className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 text-[9px] text-slate-400 dark:text-slate-400 border border-slate-100 dark:border-white/5 tracking-tight font-medium">Research</div>
                          <div className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 text-[9px] text-slate-400 border border-slate-100 dark:border-white/5 tracking-tight">Priority</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Card */}
                    <div className="h-32 w-44 sm:h-40 sm:w-56 rounded-xl border border-slate-100 dark:border-violet-500/20 bg-white/95 dark:bg-slate-900/90 shadow-[0_0_40px_rgba(139,92,246,0.2)] dark:shadow-violet-900/10 backdrop-blur-md p-4 flex flex-col gap-3 rotate-[8deg] transition-all hover:rotate-0 hover:scale-110 duration-500 group z-10 hover:border-violet-300 dark:hover:border-violet-500/40 group-hover:shadow-[0_0_80px_rgba(139,92,246,0.4)]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 group-hover:animate-pulse">
                          <span className="material-symbols-outlined text-lg">description</span>
                        </div>
                        <div className="h-2 w-20 rounded bg-slate-100 dark:bg-slate-700"></div>
                      </div>
                      <div className="space-y-1.5 mt-1">
                        <div className="h-1.5 w-full rounded bg-slate-50 dark:bg-slate-800"></div>
                        <div className="h-1.5 w-3/4 rounded bg-slate-50 dark:bg-slate-800"></div>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-white/5 text-[9px] text-amber-600/70 dark:text-amber-400/70 font-medium">Reference</span>
                        <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[9px] text-slate-400 dark:text-slate-400">Strategy</span>
                      </div>
                    </div>
                  </div>

                  {/* 마지막 남은 배경 요소들 주석 처리
                  <div className="absolute top-10 right-[10%] h-4 w-4 rounded-full bg-blue-400/20 blur-sm animate-pulse"></div>
                  
                  <div className={`absolute bottom-[12%] left-[4%] lg:left-[10%] hidden sm:block z-0 transition-opacity duration-1000 pointer-events-none filter blur-[2px] ${mounted ? 'opacity-70 dark:opacity-50 animate-float-soft' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
                    <div className="p-2.5 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/40 dark:border-white/10 rotate-[15deg] scale-105 shadow-lg">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-500/80">
                        <span className="material-symbols-outlined text-[28px]">auto_fix_high</span>
                      </div>
                    </div>
                  </div>
                  */}
                  
                  {/* Floating Folder Icon 주석 처리
                  <div className={`absolute top-[18%] left-[1%] lg:left-[5%] hidden sm:block z-0 transition-opacity duration-1000 pointer-events-none filter blur-[2px] ${mounted ? 'opacity-60 dark:opacity-40 animate-float-soft-slow' : 'opacity-0'}`}>
                    <div className="p-2.5 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/40 dark:border-white/10 rotate-[-15deg] scale-110 shadow-xl">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-500/80">
                        <span className="material-symbols-outlined text-[32px]">folder_special</span>
                      </div>
                    </div>
                  </div>
                  */}
                  
                  {/* Floating Rocket Icon 주석 처리
                  <div className={`absolute bottom-[14%] right-[0%] lg:right-[4%] hidden sm:block z-0 transition-opacity duration-1000 pointer-events-none filter blur-[1.5px] ${mounted ? 'opacity-70 dark:opacity-50 animate-float-soft' : 'opacity-0'}`} style={{ animationDelay: '2s' }}>
                    <div className="p-2.5 rounded-3xl bg-white/50 dark:bg-slate-700/50 border border-white/50 dark:border-blue-400/20 rotate-[12deg] scale-85 shadow-lg">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30 text-blue-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-[32px]">rocket</span>
                      </div>
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-background-dark dark:bg-white px-6 py-24 lg:px-20 relative z-10 border-y border-slate-800 dark:border-slate-200 min-h-screen flex items-center transition-colors duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 md:text-center md:items-center">
              <h2 className="text-3xl font-bold tracking-tight text-white dark:text-slate-900 sm:text-4xl">왜 ReLink인가요?</h2>
              <p className="text-lg text-slate-400 dark:text-slate-600 max-w-2xl">단순한 북마크를 넘어선 지능형 지식 관리 시스템을 경험하세요.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group flex flex-col rounded-3xl border border-slate-800 dark:border-slate-200 bg-slate-800/40 dark:bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/50 dark:hover:border-violet-300 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.15)] backdrop-blur-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 dark:bg-violet-100 transition-all duration-500 group-hover:bg-violet-600/20 dark:group-hover:bg-violet-200 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                  <span className="material-symbols-outlined text-violet-400 dark:text-violet-600 group-hover:text-violet-300 dark:group-hover:text-violet-700 transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(167,139,250,0.6)] text-2xl">auto_awesome</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white dark:text-slate-900">자동 분류</h3>
                <p className="text-slate-400 dark:text-slate-600 leading-relaxed text-sm">
                  AI가 콘텐츠를 분석하여 자동으로 태그를 생성하고 적절한 폴더에 정리합니다. 더 이상 수동으로 정리하지 마세요.
                </p>
              </div>
              <div className="group flex flex-col rounded-2xl border border-slate-800 dark:border-slate-200 bg-slate-800/40 dark:bg-white p-8 transition-all hover:-translate-y-1 hover:border-violet-500/30 dark:hover:border-violet-300 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-violet-500/10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 dark:bg-violet-100 transition-all duration-300 group-hover:bg-violet-500/20 dark:group-hover:bg-violet-600/10 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <span className="material-symbols-outlined text-violet-400 dark:text-violet-600 group-hover:text-violet-300 dark:group-hover:text-violet-600 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]">search</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white dark:text-slate-900">스마트 검색</h3>
                <p className="text-slate-400 dark:text-slate-600 leading-relaxed text-sm">
                  단어 하나만 기억나도 문맥을 파악하여 정확한 자료를 찾아줍니다. 자연어 검색으로 더 쉽고 빠르게 찾으세요.
                </p>
              </div>
              <div className="group flex flex-col rounded-2xl border border-slate-800 dark:border-slate-200 bg-slate-800/40 dark:bg-white p-8 transition-all hover:-translate-y-1 hover:border-violet-500/30 dark:hover:border-violet-300 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-violet-500/10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 dark:bg-violet-100 transition-all duration-300 group-hover:bg-violet-500/20 dark:group-hover:bg-violet-600/10 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                  <span className="material-symbols-outlined text-violet-400 dark:text-violet-600 group-hover:text-violet-300 dark:group-hover:text-violet-600 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]">group</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white dark:text-slate-900">팀 협업</h3>
                <p className="text-slate-400 dark:text-slate-600 leading-relaxed text-sm">
                  팀원들과 북마크 컬렉션을 공유하고 코멘트를 남기며 효율적으로 협업하세요. 지식 공유가 쉬워집니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 
        <section id="pricing" className="px-6 py-24 lg:px-20 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-white/8 min-h-screen flex items-center transition-colors duration-300">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-text-main dark:text-white sm:text-4xl">요금제 안내</h2>
              <p className="mt-4 text-text-sub dark:text-white/60">개인부터 기업까지, 당신에게 맞는 최적의 플랜을 선택하세요.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-text-main">
              <div className="flex flex-col rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">무료</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main dark:text-white">₩0</span>
                    <span className="text-sm font-medium text-text-sub dark:text-white/40">/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub dark:text-white/60">개인 사용자를 위한 필수 기능</p>
                <button className="mb-8 w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-text-main dark:text-white transition-all hover:bg-linear-to-br hover:from-violet-600 hover:to-purple-500 dark:hover:bg-violet-600 dark:hover:from-transparent dark:hover:to-transparent hover:text-white hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-violet-900/20">
                  시작하기
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    무제한 북마크
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    기본 AI 태깅 (월 100회)
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    최대 2개 디바이스
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col rounded-2xl border-2 border-primary dark:border-violet-600 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-primary/5 dark:shadow-violet-900/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-br from-violet-600 to-purple-500 dark:bg-violet-600 dark:bg-none px-3 py-1 text-xs font-bold text-white shadow-md">
                  추천
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-primary dark:text-violet-400">프로</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main dark:text-white">₩9,900</span>
                    <span className="text-sm font-medium text-text-sub dark:text-white/40">/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub dark:text-white/60">전문가를 위한 강력한 AI 기능</p>
                <button className="mb-8 w-full rounded-lg bg-linear-to-br from-violet-600 to-purple-500 dark:bg-violet-600 px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-primary/25 dark:shadow-violet-900/30 border-t border-white/20">
                  무료 체험 시작
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    고급 AI 분석 및 요약
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    무제한 검색 기록
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    우선 지원 서비스
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    모든 디바이스 동기화
                  </div>
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900/50 p-8 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">팀</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main dark:text-white">₩19,900</span>
                    <span className="text-sm font-medium text-text-sub dark:text-white/40">/인/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub dark:text-white/60">협업이 필요한 조직을 위해</p>
                <button className="mb-8 w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-text-main dark:text-white transition-all hover:bg-linear-to-br hover:from-violet-600 hover:to-purple-500 dark:hover:bg-violet-600 dark:hover:from-transparent dark:hover:to-transparent hover:text-white hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-violet-900/20">
                  문의하기
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    팀 공유 폴더 및 권한 관리
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    관리자 대시보드
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    API 액세스
                  </div>
                  <div className="flex items-center gap-3 text-sm dark:text-white/80">
                    <span className="material-symbols-outlined text-primary dark:text-violet-400 text-xl">check</span>
                    SSO 통합
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        */}
      </main>

      <footer className="border-t border-white/5 bg-[#030712] px-6 py-12 lg:px-20 relative z-20 transition-all duration-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center space-x-2 group transition-opacity">
            <span className="material-symbols-outlined text-3xl text-violet-400 group-hover:scale-110 transition-transform">language</span>
            <span className="text-xl font-bold tracking-tight text-white uppercase sm:normal-case">ReLink</span>
          </div>
          <div className="flex gap-10 text-sm text-slate-400">
            <a className="hover:text-white transition-colors" href="#">이용약관</a>
            <a className="hover:text-white transition-colors" href="#">개인정보처리방침</a>
            <a className="hover:text-white transition-colors" href="https://relink.featurebase.app/en" target="_blank" rel="noopener noreferrer">문의하기</a>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            © 2026 ReLink Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-7 right-7 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#050505]/92 text-white shadow-[0_14px_34px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-[#000000]/96 hover:shadow-[0_18px_40px_rgba(0,0,0,0.52)] active:scale-95 ${
          showScrollTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-16 opacity-0"
        }`}
        aria-label="맨 위로 가기"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
      </button>
    </div>
  );
}
