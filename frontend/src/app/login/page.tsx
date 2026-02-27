"use client";

import React from "react";
import NextLink from "next/link";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden w-screen text-text-main font-sans selection:bg-primary/20 bg-background-light dark:bg-background-dark">
      {/* Sync Header with Landing Page (page.tsx) */}
      <header className="fixed w-full top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-black px-6 py-3 lg:px-20 shadow-md">
        <NextLink href="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
          <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined !text-xl">bookmarks</span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">SearchWeb</h2>
        </NextLink>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden items-center gap-9 md:flex">
            <a className="text-white/90 hover:text-white text-sm font-medium transition-colors" href="/#features">기능</a>
            <a className="text-white/90 hover:text-white text-sm font-medium transition-colors" href="/#pricing">가격</a>
            <a className="text-white/90 hover:text-white text-sm font-medium transition-colors" href="#">문의하기</a>
          </div>
          <div className="hidden md:flex items-center">
            <NextLink href="/login" className="flex items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] px-4 py-2 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-primary/20 border-t border-white/20">
              Log In
            </NextLink>
          </div>
          <button className="md:hidden text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 pt-[60px]">
        {/* Left Section: Visual Assets */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-r border-slate-100 bg-[#F5F3FF] p-8 lg:w-1/2 lg:p-12 min-h-[400px]">
          {/* Background Blurs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary-light/10 blur-[100px]"></div>
          </div>

          <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
            {/* Text Content */}
            <div className="mb-4 flex w-full max-w-lg flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                BETA SERVICE
              </div>
              <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-text-main lg:text-4xl">
                북마크, 이제 AI가<br />
                <span className="text-primary">정리합니다</span>
              </h1>
              <p className="mx-auto max-w-sm text-sm font-light text-text-sub">
                수천 개의 링크도 단 몇 초 만에. AI가 문맥을 이해하여 자동으로 폴더를 생성하고 분류합니다.
              </p>
            </div>

            {/* 3D Visuals & Orbiting Icons */}
            <div className="relative flex h-[320px] w-full max-w-md items-center justify-center scale-75 sm:scale-90" style={{ perspective: "1000px" }}>
              {/* Central Folder */}
              <div 
                className="relative z-20 flex h-24 w-32 items-center justify-center rounded-lg border-l border-t border-white/20 bg-primary/90 shadow-2xl"
                style={{ 
                  transformStyle: "preserve-3d", 
                  animation: "float-folder 6s ease-in-out infinite" 
                }}
              >
                <div className="absolute -top-3 left-0 h-4 w-12 rounded-t-md border-l border-t border-white/20 bg-primary/90"></div>
                <span className="material-symbols-outlined !text-5xl text-white drop-shadow-md">folder_open</span>
                <div 
                  className="absolute inset-0 -z-10 rounded-lg bg-primary blur-xl" 
                  style={{ animation: "pulse-glow 3s infinite" }}
                ></div>
              </div>

              {/* Orbiting Icons - Ring 1 */}
              {[
                { icon: "mail", color: "text-blue-500", offset: "0s" },
                { icon: "image", color: "text-green-500", offset: "-4s" },
                { icon: "article", color: "text-purple-500", offset: "-8s" },
                { icon: "shopping_bag", color: "text-orange-500", offset: "-12s" },
                { icon: "favorite", color: "text-pink-500", offset: "-16s" },
              ].map((item, i) => (
                <div 
                  key={`ring1-${i}`}
                  className="absolute left-1/2 top-1/2 -ml-4 -mt-4 transition-all duration-300"
                  style={{ 
                    animation: `orbit 20s linear infinite ${item.offset}`,
                    ["--orbit-radius" as any]: "110px"
                  }}
                >
                  <div className={`flex h-9 w-9 transform items-center justify-center rounded-xl border border-slate-100 bg-white shadow-lg transition-transform hover:scale-110 ${item.color}`}>
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                  </div>
                </div>
              ))}

              {/* Orbiting Icons - Ring 2 (Reverse) */}
              {[
                { icon: "code", color: "text-indigo-500", offset: "0s" },
                { icon: "flight", color: "text-cyan-500", offset: "-6s" },
                { icon: "movie", color: "text-red-500", offset: "-12s" },
                { icon: "schedule", color: "text-teal-500", offset: "-18s" },
                { icon: "lightbulb", color: "text-amber-500", offset: "-24s" },
              ].map((item, i) => (
                <div 
                  key={`ring2-${i}`}
                  className="absolute left-1/2 top-1/2 -ml-5 -mt-5 transition-all duration-300"
                  style={{ 
                    animation: `orbit-reverse 30s linear infinite ${item.offset}`,
                    ["--orbit-radius" as any]: "160px"
                  }}
                >
                  <div className={`flex h-11 w-11 transform items-center justify-center rounded-xl border border-slate-100 bg-white shadow-lg transition-transform hover:scale-110 ${item.color}`}>
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Sign In Form */}
        <div className="relative z-20 flex w-full flex-col items-center justify-center bg-slate-50/50 p-6 lg:w-1/2 lg:p-12">
          {/* Decorative Backdrops */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-[10%] -top-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]"></div>
            <div className="absolute left-[10%] top-[40%] h-[250px] w-[250px] rounded-full bg-indigo-500/5 blur-[60px]"></div>
          </div>

          <div className="relative z-30 w-full max-w-[380px] -mt-12">
            <div className="glass-card w-full rounded-2xl bg-white/80 p-7 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl border border-white/50">
              <div className="mb-6 text-left">
                <h3 className="mb-1.5 text-2xl font-bold text-text-main">Welcome!</h3>
                <p className="text-text-sub text-xs">SearchWeb에 오신 것을 환영합니다.</p>
              </div>

              {/* Google Sign In - Purple Gradient Background */}
              <button className="group relative mb-6 flex h-11 w-full items-center justify-center gap-3 rounded-lg border-t border-white/20 bg-[linear-gradient(135deg,#6d28d9,#8b5cf6)] text-white shadow-md transition-all hover:brightness-110 hover:shadow-primary/25">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-1">
                  <svg className="h-full w-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                </div>
                <span className="text-sm font-bold">Google 계정으로 로그인</span>
              </button>

              {/* Divider */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60"></div>
                </div>
                <span className="relative bg-white/10 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
              </div>

              {/* Email Form */}
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-sub" htmlFor="email">이메일</label>
                  <input 
                    className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 text-sm text-text-main outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5" 
                    id="email" 
                    placeholder="이메일을 입력하세요" 
                    type="email"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-sub" htmlFor="password">비밀번호</label>
                  <input 
                    className="w-full rounded-lg border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 text-sm text-text-main outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    autoComplete="off"
                  />
                </div>

                <div className="mb-1 flex items-center justify-end">
                  <NextLink className="text-[11px] font-semibold text-gray-300 hover:text-primary-dark" href="#">Forgot password?</NextLink>
                </div>

                <button 
                  className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-slate-800"
                  type="submit"
                >
                  Log in
                </button>
              </form>

              <p className="mt-7 text-center text-xs text-gray-400">
                Don't have an account? <NextLink className="font-bold text-primary transition-colors hover:text-primary-dark" href="#">Sign up</NextLink>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
