import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";
import BottomTabBar from "@/components/BottomTabBar";
import GlobalMeditationWrapper from "@/components/GlobalMeditationWrapper";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallBanner from "@/components/InstallBanner";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "The Way — La Via del Cuore",
  description: "Un percorso di crescita personale ispirato agli insegnamenti del Vangelo",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Way",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${dmSans.variable} ${playfair.variable} ${dmSans.className}`}>
      <body className="pb-tabbar">
        <ServiceWorkerRegistration />
        <GlobalMeditationWrapper>
          {children}
          <BottomTabBar />
          <InstallBanner />
        </GlobalMeditationWrapper>
      </body>
    </html>
  );
}
