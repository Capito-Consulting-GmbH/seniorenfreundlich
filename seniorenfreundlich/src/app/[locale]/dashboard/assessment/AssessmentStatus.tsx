"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AssessmentSubmissionRow } from "@/src/services/assessmentSubmissionService";
import { reopenAssessmentAction } from "@/src/actions/assessmentActions";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG = {
  submitted: {
    icon: Clock,
    variant: "default" as const,
    color: "text-blue-600",
  },
  under_review: {
    icon: Clock,
    variant: "default" as const,
    color: "text-yellow-600",
  },
  approved: {
    icon: CheckCircle,
    variant: "default" as const,
    color: "text-green-600",
  },
  rejected: {
    icon: AlertCircle,
    variant: "destructive" as const,
    color: "text-destructive",
  },
};

interface Props {
  submission: AssessmentSubmissionRow;
  locale: "de" | "en";
}

export function AssessmentStatus({ submission, locale }: Props) {
  const t = useTranslations("assessment");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = submission.status;
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const Icon = cfg?.icon ?? Clock;

  const statusLabelKey = `status${status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())}` as Parameters<typeof t>[0];

  function handleReopen() {
    startTransition(async () => {
      await reopenAssessmentAction(submission.id);
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${cfg?.color ?? ""}`} />
        <div>
          <h2 className="font-semibold text-lg">{t("statusTitle")}</h2>
          <Badge variant={cfg?.variant ?? "secondary"}>
            {t(statusLabelKey)}
          </Badge>
        </div>
      </div>

      {status === "rejected" && submission.adminNotes && (
        <div className="border rounded p-4 bg-muted/10 space-y-1">
          <p className="text-sm font-medium">{t("rejectedFeedback")}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {submission.adminNotes}
          </p>
        </div>
      )}

      {status === "approved" && (
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/badge">{t("viewBadge")}</Link>
          </Button>
        </div>
      )}

      {status === "rejected" && (
        <Button onClick={handleReopen} disabled={isPending} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("editAgain")}
        </Button>
      )}
    </div>
  );
}
