import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCProvider } from '@/trpc/client'
import "./globals.css";
import "./legacy.css";
import "./mobile.css";
import { Toaster } from "@/components/ui/sonner"
import BetterAuthUIProvider from "@/providers/better-auth-ui-provider"
import { ThemeProvider } from "@/components/theme-provider"

import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Campus Helper",
  description: "Connect students with peer helpers on campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCProvider>
      <html lang="en">
        <body
          className={`${plusJakartaSans.variable} ${instrumentSerif.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BetterAuthUIProvider>{children}</BetterAuthUIProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </TRPCProvider>
  );
}
