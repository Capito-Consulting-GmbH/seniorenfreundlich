"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { Link } from "@/src/i18n/navigation";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

type OrderStatus = "pending" | "paid" | "failed" | "expired" | "refunded" | null;

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 20;

export default function PaymentPoller() {
  const t = useTranslations("dashboard.billing");
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const pollCount = useRef(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      pollCount.current += 1;

      try {
        const res = await fetch("/api/orders/latest-status");
        if (res.ok) {
          const data = (await res.json()) as { status: OrderStatus };
          setStatus(data.status);

          if (data.status === "paid") {
            setTimeout(() => router.push("/dashboard/badge"), 1500);
            return;
          }

          if (data.status === "failed" || data.status === "expired") {
            return;
          }
        }
      } catch {
        // Network error — keep trying
      }

      if (pollCount.current >= MAX_POLLS) {
        setGaveUp(true);
        return;
      }

      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    }

    timeoutId = setTimeout(poll, POLL_INTERVAL_MS);

    return () => clearTimeout(timeoutId);
  }, [router]);

  if (status === "paid") {
    return (
      <Alert className="mt-4">
        <AlertDescription className="flex items-center gap-2">
          <span className="text-lg">✓</span>
          <span className="font-medium">{t("paymentSuccess")}</span>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "failed") {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>
          <p className="font-medium">{t("paymentFailedTitle")}</p>
          <p className="mt-1">{t("paymentFailedDesc")}</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "expired") {
    return (
      <Alert className="mt-4">
        <AlertDescription>
          <p className="font-medium">{t("paymentExpiredTitle")}</p>
          <p className="mt-1">{t("paymentExpiredDesc")}</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (gaveUp) {
    return (
      <Alert className="mt-4">
        <AlertDescription>
          <p className="font-medium">{t("paymentTimeoutTitle")}</p>
          <p className="mt-1">
            {t("paymentTimeoutDesc")}{" "}
            <Link href="/dashboard/badge" className="underline">
              {t("paymentTimeoutLink")}
            </Link>
            .
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mt-4">
      <AlertDescription className="flex items-center gap-3">
        <Spinner />
        <span>{t("paymentPending")}</span>
      </AlertDescription>
    </Alert>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
