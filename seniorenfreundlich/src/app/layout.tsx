import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "@/src/env";
import { env } from "@/src/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Seniorenfreundlich.de – Das Siegel für seniorenfreundliche Unternehmen",
    template: "%s | Seniorenfreundlich.de",
  },
  description:
    "Zertifizierung für Unternehmen, die besondere Rücksicht auf die Bedürfnisse älterer Menschen nehmen.",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiebotId = env.NEXT_PUBLIC_COOKIEBOT_ID;
  const gaMeasurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="de">
      <head>
        {/* Cookiebot — consent management (plain script required; next/script beforeInteractive not supported in App Router) */}
        {cookiebotId && (
          <script
            id="cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={cookiebotId}
            data-blockingmode="auto"
            type="text/javascript"
            async
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider dynamic>
          {children}
        </ClerkProvider>

        {/* GA4 — only injected when ID is present; Cookiebot controls consent */}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
        
        {/* Vercel Web Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
