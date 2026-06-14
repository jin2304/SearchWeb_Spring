import Image from "next/image";
import Link from "next/link";

const footerLinks: { label: string; href: string }[] = [];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-10 dark:border-white/10 dark:bg-[#030712]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/relink_logo.png"
                alt=""
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="text-lg font-bold text-slate-950 dark:text-white">
                ReLink
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              흩어진 링크를 폴더와 태그로 정리하고, 검색과 필터로 다시
              활용하는 AI 링크 관리 서비스입니다.
            </p>
          </div>
          <nav
            aria-label="하단 메뉴"
            className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 transition-colors hover:text-violet-700 dark:text-slate-400 dark:hover:text-violet-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row">
          <span>© 2026 ReLink. All rights reserved.</span>
          <a
            href="https://relink.featurebase.app/en"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
          >
            문의 및 피드백
          </a>
        </div>
      </div>
    </footer>
  );
}
