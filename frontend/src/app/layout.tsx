import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { SaveLinkDialog } from "@/components/dialogs/SaveLinkDialog";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SearchWeb - 북마크의 진화, AI 지능형 관리",
  description: "AI를 통해 북마크를 지능적으로 관리하세요. SearchWeb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Material Symbols Outlined Font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background-light dark:bg-background-dark text-text-main h-screen overflow-hidden flex transition-colors duration-200`}>
        <QueryProvider>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
          <SaveLinkDialog />
          <CreateFolderDialog />
        </QueryProvider>
      </body>
    </html>
  );
}
