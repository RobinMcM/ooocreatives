import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { SuperTokensProvider } from "@/components/SuperTokensProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Out of Office Creatives",
  description: "Theatre platform for ooocreatives.com",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon-180x180.png",
  },
  appleWebApp: {
    capable: true,
    title: "OOO Creatives",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);})();` }} />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
        <SuperTokensProvider>
          <AppShell>{children}</AppShell>
        </SuperTokensProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
