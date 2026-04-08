"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "pending" | "paid" | "failed" | "expired" | "refunded" | null;

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 20; // ~50 seconds, then give up

export default function PaymentPoller() {
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
            // Give the user a brief moment to see the success state, then navigate
            setTimeout(() => router.push("/dashboard/badge"), 1500);
            return;
          }

          if (data.status === "failed" || data.status === "expired") {
            // Terminal states — stop polling
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
      <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">✓</span>
          <span className="font-medium">Zahlung erfolgreich! Sie werden weitergeleitet…</span>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">Die Zahlung ist fehlgeschlagen.</p>
        <p className="mt-1">Bitte versuchen Sie es erneut.</p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium">Die Zahlung ist abgelaufen.</p>
        <p className="mt-1">Bitte starten Sie einen neuen Checkout.</p>
      </div>
    );
  }

  if (gaveUp) {
    return (
      <div className="mt-4 rounded-md bg-zinc-100 p-4 text-sm text-zinc-700">
        <p className="font-medium">Zahlung konnte nicht bestätigt werden.</p>
        <p className="mt-1">
          Bitte prüfen Sie in wenigen Minuten den{" "}
          <a href="/dashboard/badge" className="underline">
            Siegel-Status
          </a>
          .
        </p>
      </div>
    );
  }

  // Pending / still polling
  return (
    <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
      <div className="flex items-center gap-3">
        <Spinner />
        <span>Zahlung wird bestätigt…</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-blue-600"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
