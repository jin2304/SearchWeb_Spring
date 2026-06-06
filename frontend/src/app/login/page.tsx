"use client";

import React from "react";
import NextLink from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { buildBackendUrl } from "@/lib/config/backend";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { StarField } from "@/components/ui/StarField";

export default function LoginPage() {

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden w-screen text-text-main font-sans selection:bg-primary/20 bg-background-light dark:bg-background-dark">
      {/* Sync Header with Landing Page (page.tsx) */}
      <LandingHeader isLoginPage />

      {/* ========================================================
          1. DESKTOP VERSION (lg:flex, hidden on mobile)
             - This is 100% identical to the original code layout.
         ======================================================== */}
      <main className="hidden lg:flex flex-1 flex-row min-h-0 pt-11">
        {/* Left Section: Visual Assets (Galaxy Background) */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden border-r border-slate-100 dark:border-white/5 bg-[#F5F3FF] dark:bg-[#020617] p-8 lg:w-1/2 lg:p-12 min-h-[400px] transition-colors duration-1000">
          {/* Cosmic Background System (Light: Crystal Aurora / Dark: Galaxy) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Nebula Layers - Adapted for Light/Dark themes */}
            <div 
              className="absolute -left-[10%] -top-[10%] h-[80%] w-[80%] rounded-full bg-primary/10 dark:bg-primary/15 blur-[120px]"
              style={{ animation: "nebula-pulse 15s ease-in-out infinite" }}
            ></div>
            <div 
              className="absolute -right-[15%] bottom-[10%] h-[70%] w-[70%] rounded-full bg-cyan-400/15 dark:bg-indigo-600/10 blur-[100px]"
              style={{ animation: "nebula-pulse 20s ease-in-out infinite reverse" }}
            ></div>
            <div 
              className="absolute left-[20%] top-[30%] h-[40%] w-[40%] rounded-full bg-pink-400/20 dark:bg-violet-500/10 blur-[90px]"
              style={{ animation: "rotate-slow 30s linear infinite" }}
            ></div>

            {/* Dense Star/Light Field (Twinkling Crystal Shards) - Hidden in Light Mode */}
            <StarField opacity={0.4} keyPrefix="desktop-star" />
          </div>

          <div className="relative z-10 flex w-full flex-col items-center justify-center text-center -mt-10">
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16 hidden lg:flex w-full max-w-md flex-col items-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-primary shadow-sm">
                BETA SERVICE
              </div>
              <h1 className="mb-6 text-2xl sm:text-3xl font-black leading-[1.3] tracking-tight text-text-main lg:text-4xl break-keep">
                쌓여가는 링크,<br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400 whitespace-nowrap">AI가 당신의 시간을 찾아드립니다</span>
              </h1>
              <p className="mx-auto max-w-sm text-sm font-light text-text-sub leading-relaxed">
                정리는 AI에게 맡기고 본질에만 집중하세요. <br/>
                단순한 저장을 넘어, AI가 스스로 이해하고 분류하는 지능형 저장소를 완성하세요.
              </p>
            </motion.div>

            {/* 3D Visuals & Orbiting Icons */}
            <div className="relative flex h-[280px] lg:h-[350px] w-full max-w-lg items-center justify-center scale-75 xs:scale-85 lg:scale-100" style={{ perspective: "1200px", transformStyle: "preserve-3d" }}>
              {/* Data Particles (Digital Dust) - Integrated with Star Field - Hidden in Light Mode */}
              <div className="absolute inset-x-[-20%] inset-y-[-20%] pointer-events-none -z-10 hidden dark:block" style={{ transformStyle: "preserve-3d" }}>
                {[
                  { l: "20%", t: "30%", z: "120px", d: "0s" },
                  { l: "70%", t: "20%", z: "-80px", d: "-1s" },
                  { l: "40%", t: "80%", z: "60px", d: "-2s" },
                  { l: "80%", t: "60%", z: "-150px", d: "-3s" },
                  { l: "15%", t: "65%", z: "90px", d: "-4s" },
                  { l: "55%", t: "45%", z: "180px", d: "-5s" },
                ].map((p, i) => (
                  <div 
                    key={`part-desktop-${i}`}
                    className="absolute h-[3px] w-[3px] bg-primary/60 dark:bg-primary/80 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                    style={{ 
                      left: p.l,
                      top: p.t,
                      transform: `translateZ(${p.z}) translateZ(0)`,
                      animation: `float-soft ${5 + i % 3}s ease-in-out infinite ${p.d}`,
                      willChange: "transform"
                    }}
                  ></div>
                ))}
              </div>

              {/* Central 3D Folder Composite */}
              <div 
                className="absolute z-20" 
                style={{ 
                  transformStyle: "preserve-3d", 
                  animation: "float-folder 6s ease-in-out infinite",
                  willChange: "transform"
                }}
              >
                {/* Static Tilt Wrapper with Rendering Fixes */}
                <div style={{ transform: "rotateY(-18deg) rotateX(10deg)", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
                  {/* Back Plate & Tab */}
                  <div 
                    className="relative h-24 w-32 rounded-lg bg-[#5b21b6] border-l border-t border-white/20 shadow-2xl" 
                    style={{ 
                      transformStyle: "preserve-3d", 
                      outline: "1px solid transparent",
                      backfaceVisibility: "hidden" 
                    }}
                  >
                    {/* Tab */}
                    <div className="absolute -top-2.5 left-0 h-4 w-12 rounded-t-lg bg-[#5b21b6] border-l border-t border-white/20"></div>
                    
                    {/* Middle: Inner Content / Processing Light */}
                    <div 
                      className="absolute inset-x-2 top-2 bottom-4 rounded-md bg-indigo-950/50 border border-white/5 flex items-center justify-center"
                      style={{ transform: "translateZ(10px) translateZ(0)", backfaceVisibility: "hidden" }}
                    >
                      <div className="h-10 w-10 bg-primary/20 blur-xl rounded-full"></div>
                      <div className="h-3 w-3 bg-white/40 blur-sm rounded-full animate-pulse"></div>
                    </div>

                    {/* Front Flap: Angled Forward for 3D Depth with Tab Shape */}
                    <div 
                      className="absolute inset-0 rounded-lg border-l border-t border-white/40 bg-[#6d28d9] shadow-[15px_5px_30px_rgba(0,0,0,0.5)] flex items-center justify-center"
                      style={{ 
                        transformStyle: "preserve-3d",
                        transformOrigin: "left bottom",
                        transform: "translateZ(22px) rotateY(-12deg) translateZ(0)",
                        outline: "1px solid transparent",
                        backfaceVisibility: "hidden"
                      }}
                    >
                      {/* Front Tab Shape */}
                      <div className="absolute -top-3 left-0 h-4 w-14 rounded-t-lg bg-[#6d28d9] border-l border-t border-white/40"></div>
                      
                      <span className="material-symbols-outlined !text-5xl text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">folder</span>
                      
                      {/* Edge Highlights and Shine */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>

                    {/* External Background Glow */}
                    <div 
                      className="absolute inset-0 -z-20 rounded-lg bg-primary blur-[40px] opacity-20" 
                      style={{ animation: "pulse-glow 5s infinite" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Tilted Orbit Plane Wrapper */}
              <div className="absolute inset-0 flex items-center justify-center z-10" style={{ transform: "rotateX(60deg) rotateY(-5deg)", transformStyle: "preserve-3d" }}>
                {/* Orbit Rings - Visual Guide Lines (Sharp version) */}
                <div className="absolute h-[280px] w-[280px] rounded-full border border-primary/20 dark:border-primary/10"></div>
                <div className="absolute h-[440px] w-[440px] rounded-full border border-dashed border-primary/15 dark:border-primary/5"></div>
                
                {/* Orbiting Icons - Ring 1 */}
                {[
                  { icon: "mail", color: "text-blue-500", offset: "0s" },
                  { icon: "image", color: "text-emerald-500", offset: "-4s" },
                  { icon: "article", color: "text-purple-500", offset: "-8s" },
                  { icon: "shopping_bag", color: "text-orange-500", offset: "-12s" },
                  { icon: "favorite", color: "text-pink-500", offset: "-16s" },
                ].map((item, i) => (
                  <div 
                    key={`ring1-desktop-${i}`}
                    className="absolute left-1/2 top-1/2 -ml-5 -mt-5 transition-all duration-300"
                    style={{ 
                      animation: `orbit 20s linear infinite ${item.offset}`,
                      ["--orbit-radius" as any]: "140px",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Counter-rotation to keep icons billboarded + icon-depth animation */}
                    <div style={{ animation: `icon-depth 20s linear infinite ${item.offset}` }} className="transition-all duration-300">
                      {/* Simplified Frosted Glass Bubble (Reduced 3D) */}
                      <div className="relative flex h-10 w-10 transform items-center justify-center rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:scale-110">
                        {/* Subdued Inner Glow */}
                        <div className={`absolute inset-1 rounded-full opacity-10 blur-sm bg-current ${item.color}`}></div>
                        <span className={`material-symbols-outlined relative z-10 drop-shadow-sm ${item.color}`} style={{ fontSize: "16px" }}>{item.icon}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Orbiting Icons - Ring 2 */}
                {[
                  { icon: "code", color: "text-indigo-500", offset: "0s" },
                  { icon: "flight", color: "text-cyan-500", offset: "-6s" },
                  { icon: "movie", color: "text-red-500", offset: "-12s" },
                  { icon: "schedule", color: "text-teal-500", offset: "-18s" },
                  { icon: "lightbulb", color: "text-amber-500", offset: "-24s" },
                ].map((item, i) => (
                  <div 
                    key={`ring2-desktop-${i}`}
                    className="absolute left-1/2 top-1/2 -ml-6 -mt-6 transition-all duration-300"
                    style={{ 
                      animation: `orbit-reverse 30s linear infinite ${item.offset}`,
                      ["--orbit-radius" as any]: "220px",
                      transformStyle: "preserve-3d"
                    }}
                  >
                    {/* Counter-rotation to keep icons billboarded + icon-depth animation */}
                    <div style={{ animation: `icon-depth 30s linear infinite ${item.offset}` }} className="transition-all duration-300">
                      {/* Simplified Frosted Glass Bubble (Reduced 3D) */}
                      <div className="relative flex h-12 w-12 transform items-center justify-center rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-110">
                        {/* Subdued Inner Glow */}
                        <div className={`absolute inset-1 rounded-full opacity-10 blur-sm bg-current ${item.color}`}></div>
                        <span className={`material-symbols-outlined relative z-10 drop-shadow-sm ${item.color}`} style={{ fontSize: "18px" }}>{item.icon}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Sign In Form */}
        <div className="relative z-20 flex w-full flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 p-6 lg:w-1/2 lg:p-12">
          {/* Decorative Backdrops */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"></div>
            <div className="absolute left-[10%] top-[40%] h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px]"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-30 w-full max-w-[420px] -mt-20 text-center"
          >
            <div className="glass-card w-full rounded-3xl bg-white/70 dark:bg-slate-900/70 p-10 shadow-[0_32px_64px_rgba(124,58,237,0.12)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl border border-white/40 dark:border-white/5">
              <div className="mb-4 flex flex-col items-center">
                {/* Brand Logo Image - Max Quality (Unoptimized) */}
                <div className="mb-0 flex h-20 w-20 items-center justify-center relative">
                  {/* Soft Background Glow */}
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-50 opacity-50"></div>
                  
                  <div className="relative h-[52px] w-[52px] transition-transform duration-500 hover:scale-105">
                    <Image
                      src="/relink_logo.png"
                      alt="ReLink Logo"
                      width={512} 
                      height={512}
                      unoptimized={true}
                      priority
                      className="h-full w-full object-contain rounded-[14px] drop-shadow-[0_8px_16px_rgba(109,40,217,0.3)] transition-all"
                    />
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-text-main tracking-tight">Hello ReLink!</h3>
                <p className="text-text-sub text-[13px] font-medium leading-relaxed">당신의 링크, 이제 AI와 함께<br/>스마트하게 관리하세요</p>
              </div>

              {/* Enhanced Google Sign In Button */}
              <button 
                type="button" 
                onClick={() => { window.location.href = buildBackendUrl('/oauth2/authorization/google'); }} 
                className="group relative mb-6 flex h-[42px] w-[260px] max-w-full mx-auto items-center justify-center gap-2 rounded-lg border border-white/20 bg-gradient-to-br from-primary via-violet-500 to-indigo-600 text-white shadow-[0_8px_16px_-6px_rgba(109,40,217,0.5)] transition-all hover:scale-[1.01] hover:brightness-110 active:scale-[0.99]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white p-1 shadow-sm">
                  <svg className="h-full w-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <title>Google Logo</title>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                </div>
                <span className="text-[13px] font-bold tracking-tight">Google 계정으로 계속하기</span>
                
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Benefits Section - Sophisticated Icon Cards */}
              <div className="space-y-4 pt-8 mt-2 border-t border-slate-200/50 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] text-center mb-6">Why ReLink?</p>
                <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                  {/* AI Feature */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-500/20">
                      <span className="material-symbols-outlined !text-base">auto_awesome</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-sub dark:text-slate-400 whitespace-nowrap">AI 자동 분류</span>
                  </div>

                  {/* Sync Feature */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-500/20">
                      <span className="material-symbols-outlined !text-base">sync</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-sub dark:text-slate-400 whitespace-nowrap">자동 동기화</span>
                  </div>

                  {/* Search Feature */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 shadow-sm border border-purple-100/50 dark:border-purple-500/20">
                      <span className="material-symbols-outlined !text-base">search</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-sub dark:text-slate-400 whitespace-nowrap">강력한 검색</span>
                  </div>
                </div>
              </div>

              <p className="mt-10 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                로그인함으로써 ReLink의 <br />
                <a href="#" className="underline hover:text-primary transition-colors font-medium">이용약관</a> 및 <a href="#" className="underline hover:text-primary transition-colors font-medium">개인정보처리방침</a>에 동의하게 됩니다.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ========================================================
          2. MOBILE VERSION (lg:hidden, flex-col layout overlay)
         ======================================================== */}
      <main className="relative lg:hidden flex flex-1 flex-col min-h-0 pt-11">
        {/* Background Overlay (Galaxy Background matching desktop left section) */}
        <div className="fixed inset-0 z-0 flex w-full flex-col items-center justify-center overflow-hidden bg-[#F5F3FF] dark:bg-[#020617] transition-colors duration-1000">
          {/* Cosmic Background System */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div 
              className="absolute -left-[10%] -top-[10%] h-[80%] w-[80%] rounded-full bg-primary/20 dark:bg-primary/20 blur-[120px]"
              style={{ animation: "nebula-pulse 15s ease-in-out infinite" }}
            ></div>
            <div 
              className="absolute -right-[15%] bottom-[10%] h-[70%] w-[70%] rounded-full bg-cyan-400/20 dark:bg-indigo-600/15 blur-[100px]"
              style={{ animation: "nebula-pulse 20s ease-in-out infinite reverse" }}
            ></div>
            <div 
              className="absolute left-[20%] top-[30%] h-[40%] w-[40%] rounded-full bg-pink-400/25 dark:bg-violet-500/15 blur-[90px]"
              style={{ animation: "rotate-slow 30s linear infinite" }}
            ></div>

            <StarField opacity={0.5} keyPrefix="mobile-star" />
          </div>
        </div>

        {/* Sign In Form (Floating on top of the galaxy background) */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center bg-transparent p-6 min-h-[calc(100vh-44px)]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[380px] text-center flex flex-col justify-center my-auto"
          >
            <div className="glass-card w-full rounded-[28px] bg-white/75 dark:bg-slate-900/60 p-8 shadow-[0_32px_64px_rgba(124,58,237,0.15)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/50 dark:border-white/10 relative overflow-hidden">
              {/* Inner card subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none rounded-[28px]"></div>
              
              <div className="mb-6 flex flex-col items-center relative z-10">
                <div className="mb-2 flex h-20 w-20 items-center justify-center relative">
                  <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-75 opacity-60"></div>
                  <div className="relative h-[56px] w-[56px]">
                    <Image
                      src="/relink_logo.png"
                      alt="ReLink Logo"
                      width={512} 
                      height={512}
                      unoptimized={true}
                      priority
                      className="h-full w-full object-contain rounded-2xl drop-shadow-[0_8px_16px_rgba(109,40,217,0.4)]"
                    />
                  </div>
                </div>
                <h3 className="mb-2 text-[26px] font-black text-text-main tracking-tight bg-clip-text">Hello ReLink!</h3>
                <p className="text-text-sub text-[14px] font-medium leading-relaxed">
                  당신의 링크, 이제 AI와 함께<br/>스마트하게 관리하세요
                </p>
              </div>

              <div className="relative z-10">
                <button 
                  type="button" 
                  onClick={() => { window.location.href = buildBackendUrl('/oauth2/authorization/google'); }} 
                  className="group relative mb-6 flex h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-gradient-to-br from-primary via-violet-500 to-indigo-600 text-white shadow-[0_8px_20px_-6px_rgba(109,40,217,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white p-1 shadow-sm">
                    <svg className="h-full w-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <title>Google Logo</title>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold tracking-tight">Google 계정으로 계속하기</span>
                </button>
              </div>

              <div className="space-y-4 pt-6 mt-4 border-t border-slate-200/50 dark:border-white/10 relative z-10">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-[0.2em] text-center mb-4">Why ReLink?</p>
                <div className="flex justify-between max-w-[240px] mx-auto">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm border border-indigo-100/50 dark:border-indigo-500/30">
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    </div>
                    <span className="text-[11px] font-bold text-text-sub dark:text-slate-300 whitespace-nowrap">AI 자동 분류</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 shadow-sm border border-blue-100/50 dark:border-blue-500/30">
                      <span className="material-symbols-outlined text-[18px]">sync</span>
                    </div>
                    <span className="text-[11px] font-bold text-text-sub dark:text-slate-300 whitespace-nowrap">자동 동기화</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 shadow-sm border border-purple-100/50 dark:border-purple-500/30">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                    </div>
                    <span className="text-[11px] font-bold text-text-sub dark:text-slate-300 whitespace-nowrap">강력한 검색</span>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed relative z-10">
                로그인함으로써 ReLink의 <br />
                <a href="#" className="underline hover:text-primary dark:hover:text-violet-400 transition-colors font-medium">이용약관</a> 및 <a href="#" className="underline hover:text-primary dark:hover:text-violet-400 transition-colors font-medium">개인정보처리방침</a>에 동의하게 됩니다.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
