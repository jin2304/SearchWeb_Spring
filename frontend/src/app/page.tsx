"use client";

import NextLink from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden w-screen text-text-main font-sans selection:bg-primary/20 bg-background-light dark:bg-background-dark">
      <header className="fixed w-full top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-black px-6 py-3 lg:px-20 shadow-md">
        <NextLink href="#" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
          <div className="size-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined !text-xl">bookmarks</span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">SearchWeb</h2>
        </NextLink>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden items-center gap-9 md:flex">
            <a className="text-white/90 hover:text-white text-sm font-medium transition-colors" href="#features">기능</a>
            <a className="text-white/90 hover:text-white text-sm font-medium transition-colors" href="#pricing">가격</a>
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

      <main className="flex-grow">
        <section className="relative flex min-h-[100dvh] items-center overflow-hidden pt-24 pb-16 lg:pt-28 lg:pb-24 px-6 lg:px-20">
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-primary/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-primary-light/40 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4"></div>
          <div className="w-full mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row justify-between gap-8 lg:items-center">
              <div className="flex flex-col gap-8 lg:w-[50%] lg:pr-10">
                <div className="space-y-4 text-left">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    지금 가장 스마트한 북마크, SearchWeb 2.0
                  </div>
                  <h1 className="text-text-main text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl pt-2">
                    북마크의 진화,<br/>
                    <span className="bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] bg-clip-text text-transparent">AI 지능형</span> 관리
                  </h1>
                  <p className="text-text-sub text-lg font-normal leading-relaxed max-w-lg">
                    저장하고, 자동 태그하고, 다시 활용하세요.<br/>
                    SearchWeb의 AI가 당신의 지식 관리를 돕습니다.<br/>
                    단순한 링크 저장을 넘어선 지식 베이스를 구축하세요.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <NextLink href="/login" className="flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:brightness-105 text-white text-sm font-semibold h-11 px-6 rounded-lg transition-all shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4),0_8px_10px_-6px_rgba(124,58,237,0.2)] whitespace-nowrap border-t border-white/20">
                    <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white p-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    계정으로 바로 시작하기
                  </NextLink>
                  <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-text-sub border border-slate-200 text-sm font-semibold h-11 px-6 rounded-lg transition-all whitespace-nowrap">
                    <span className="material-symbols-outlined text-primary !text-lg">play_circle</span>
                    데모 영상 보기
                  </button>
                </div>

                <div className="flex flex-col gap-5 border-t border-slate-200/50 pt-8 mt-4 relative z-10">
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:border-transparent group-hover:text-white group-hover:shadow-md group-hover:-translate-y-0.5">
                      <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main text-base mb-0.5 transition-colors group-hover:text-primary">AI 자동 태깅</h4>
                      <p className="text-sm text-text-sub">문서 내용을 분석하여 자동으로 카테고리를 분류합니다.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:border-transparent group-hover:text-white group-hover:shadow-md group-hover:-translate-y-0.5">
                      <span className="material-symbols-outlined text-[22px]">folder_open</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main text-base mb-0.5 transition-colors group-hover:text-primary">스마트 폴더 추천</h4>
                      <p className="text-sm text-text-sub">프로젝트별, 팀별 문서를 마법처럼 알아서 정리합니다.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:border-transparent group-hover:text-white group-hover:shadow-md group-hover:-translate-y-0.5">
                      <span className="material-symbols-outlined text-[22px]">bolt</span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-text-main text-base mb-0.5 transition-colors group-hover:text-primary">초고속 검색</h4>
                      <p className="text-sm text-text-sub">수만 개의 문서 중 원하는 내용을 0.1초 만에 발견하세요.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-[50%] flex justify-center lg:justify-end mt-12 lg:mt-0">
                <div className="relative aspect-[16/9] lg:aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-primary/5"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-8 text-center flex flex-col items-center">
                    <div className="flex gap-4">
                      <div className="h-24 w-40 sm:h-32 sm:w-52 rounded-lg bg-white shadow-lg border border-slate-100 p-3 flex flex-col gap-2 rotate-[-6deg]">
                        <div className="h-2 w-16 sm:h-3 sm:w-24 rounded bg-slate-200"></div>
                        <div className="h-2 w-24 sm:h-3 sm:w-32 rounded bg-slate-100"></div>
                        <div className="mt-auto h-6 sm:h-8 w-full rounded bg-primary/10"></div>
                      </div>
                      <div className="h-24 w-40 sm:h-32 sm:w-52 rounded-lg bg-white shadow-xl border border-primary/20 p-3 flex flex-col gap-2 z-10 scale-110 relative">
                        <div className="h-2 w-20 sm:h-3 sm:w-28 rounded bg-primary/20"></div>
                        <div className="h-2 w-full sm:h-3 rounded bg-slate-100"></div>
                        <div className="mt-auto flex gap-2">
                          <span className="px-2 py-0.5 sm:py-1 rounded-full bg-primary text-[8px] sm:text-[10px] text-white">AI Tag</span>
                        </div>
                      </div>
                      <div className="h-24 w-40 sm:h-32 sm:w-52 rounded-lg bg-white shadow-lg border border-slate-100 p-3 flex flex-col gap-2 rotate-[6deg]">
                        <div className="h-2 w-12 sm:h-3 sm:w-16 rounded bg-slate-200"></div>
                        <div className="h-2 w-20 sm:h-3 sm:w-28 rounded bg-slate-100"></div>
                        <div className="mt-auto h-6 sm:h-8 w-full rounded bg-primary/10"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white px-6 py-24 lg:px-20 relative z-10 border-t border-slate-100 min-h-screen flex items-center">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 md:text-center md:items-center">
              <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">왜 SearchWeb인가요?</h2>
              <p className="text-lg text-text-sub max-w-2xl">단순한 북마크를 넘어선 지능형 지식 관리 시스템을 경험하세요.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group flex flex-col rounded-2xl border border-slate-100 bg-background-light p-8 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-100 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">자동 분류</h3>
                <p className="text-text-sub leading-relaxed text-sm">
                  AI가 콘텐츠를 분석하여 자동으로 태그를 생성하고 적절한 폴더에 정리합니다. 더 이상 수동으로 정리하지 마세요.
                </p>
              </div>
              <div className="group flex flex-col rounded-2xl border border-slate-100 bg-background-light p-8 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-100 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">스마트 검색</h3>
                <p className="text-text-sub leading-relaxed text-sm">
                  단어 하나만 기억나도 문맥을 파악하여 정확한 자료를 찾아줍니다. 자연어 검색으로 더 쉽고 빠르게 찾으세요.
                </p>
              </div>
              <div className="group flex flex-col rounded-2xl border border-slate-100 bg-background-light p-8 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-100 group-hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">팀 협업</h3>
                <p className="text-text-sub leading-relaxed text-sm">
                  팀원들과 북마크 컬렉션을 공유하고 코멘트를 남기며 효율적으로 협업하세요. 지식 공유가 쉬워집니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 py-24 lg:px-20 bg-background-light dark:bg-background-dark border-t border-slate-100 min-h-screen flex items-center">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-text-main sm:text-4xl">요금제 안내</h2>
              <p className="mt-4 text-text-sub">개인부터 기업까지, 당신에게 맞는 최적의 플랜을 선택하세요.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-text-main">
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-main">무료</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main">₩0</span>
                    <span className="text-sm font-medium text-text-sub">/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub">개인 사용자를 위한 필수 기능</p>
                <button className="mb-8 w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-text-main transition-all hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:text-white hover:shadow-lg hover:shadow-primary/20">
                  시작하기
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    무제한 북마크
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    기본 AI 태깅 (월 100회)
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    최대 2개 디바이스
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-white p-8 shadow-xl shadow-primary/5">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] px-3 py-1 text-xs font-bold text-white shadow-md">
                  추천
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-primary">프로</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main">₩9,900</span>
                    <span className="text-sm font-medium text-text-sub">/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub">전문가를 위한 강력한 AI 기능</p>
                <button className="mb-8 w-full rounded-lg bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-primary/25 border-t border-white/20">
                  무료 체험 시작
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    고급 AI 분석 및 요약
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    무제한 검색 기록
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    우선 지원 서비스
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    모든 디바이스 동기화
                  </div>
                </div>
              </div>

              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-main">팀</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-text-main">₩19,900</span>
                    <span className="text-sm font-medium text-text-sub">/인/월</span>
                  </div>
                </div>
                <p className="mb-6 text-sm text-text-sub">협업이 필요한 조직을 위해</p>
                <button className="mb-8 w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-text-main transition-all hover:bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:text-white hover:shadow-lg hover:shadow-primary/20">
                  문의하기
                </button>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    팀 공유 폴더 및 권한 관리
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    관리자 대시보드
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    API 액세스
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">check</span>
                    SSO 통합
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 lg:px-20 relative z-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined !text-lg">bookmarks</span>
            </div>
            <span className="text-lg font-bold text-text-main">SearchWeb</span>
          </div>
          <div className="flex gap-8 text-sm text-text-sub">
            <a className="hover:text-primary transition-colors" href="#">이용약관</a>
            <a className="hover:text-primary transition-colors" href="#">개인정보처리방침</a>
            <a className="hover:text-primary transition-colors" href="#">문의하기</a>
          </div>
          <div className="text-sm text-text-sub">
            © 2026 SearchWeb Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
