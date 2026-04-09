"use client";

import Script from "next/script";

export function CookiebotScript({ cbid }: { cbid: string }) {
  return (
    <Script
      id="cookiebot"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid={cbid}
      data-blockingmode="auto"
      strategy="afterInteractive"
    />
  );
}
