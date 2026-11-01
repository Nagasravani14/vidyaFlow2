import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SpiderBackground from "@/components/SpiderBackground";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VidyaFlow — Cinematic Spider-Verse AI Adaptive Learning",
  description:
    "An AI-powered adaptive learning platform for Classes 6-10 (Telangana SCERT & ICSE) with a cinematic Spider-Verse experience.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('vf_theme');
                if (storedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen bg-[var(--spider-bg)] text-[var(--spider-text)] antialiased selection:bg-spider-red-500/30 selection:text-spider-red-300`}
      >
        {/* Full Cinematic Spider-Verse Multi-Layer Background */}
        <SpiderBackground intensity="full" interactive={true} />

        {/* Foreground Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
