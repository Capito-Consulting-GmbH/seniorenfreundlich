"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { revokeBadgeAction, type RevokeBadgeState } from "@/src/actions/revokeBadge";

const initialState: RevokeBadgeState = {};

export default function RevokeBadgeForm() {
  const t = useTranslations("dashboard.badge");
  const [state, formAction, pending] = useActionState(revokeBadgeAction, initialState);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        {t("revokeButton")}
      </button>

      {state.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-green-700">{t("revokeSuccess")}</p>}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-zinc-900">{t("revokeConfirm")}</h3>
            <p className="mt-2 text-sm text-zinc-500">{t("revokeConfirmDesc")}</p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                {t("revokeCancel")}
              </button>
              <form action={formAction}>
                <button
                  type="submit"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 sm:w-auto"
                >
                  {pending ? t("revoking") : t("revokeButton")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
