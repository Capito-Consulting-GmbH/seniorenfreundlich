"use client";

import { useActionState } from "react";
import { revokeBadgeAction, type RevokeBadgeState } from "@/src/actions/revokeBadge";

const initialState: RevokeBadgeState = {};

export default function RevokeBadgeForm() {
  const [state, action, pending] = useActionState(revokeBadgeAction, initialState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm("Siegel wirklich entwerten? Diese Aktion ist nicht rueckgaengig.");
        if (!ok) {
          e.preventDefault();
        }
      }}
      className="mt-6"
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {pending ? "Wird entwertet..." : "Siegel entwerten"}
      </button>
      {state.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state.success && <p className="mt-2 text-sm text-green-700">Siegel wurde entwertet.</p>}
    </form>
  );
}
