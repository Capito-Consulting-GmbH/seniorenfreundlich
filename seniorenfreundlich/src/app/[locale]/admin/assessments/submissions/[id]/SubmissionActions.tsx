"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AssessmentSubmissionRow } from "@/src/services/assessmentSubmissionService";
import {
  startReviewAction,
  abortReviewAction,
  approveSubmissionAction,
  rejectSubmissionAction,
} from "@/src/actions/admin/adminAssessmentActions";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

interface Props {
  submission: AssessmentSubmissionRow;
}

export function SubmissionActions({ submission }: Props) {
  const t = useTranslations("admin.assessments.submission");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  function handleStartReview() {
    startTransition(async () => {
      await startReviewAction(submission.id);
      router.refresh();
    });
  }

  function handleAbort() {
    startTransition(async () => {
      await abortReviewAction(submission.id);
      setAbortDialogOpen(false);
      router.refresh();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await approveSubmissionAction(submission.id);
      setApproveDialogOpen(false);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectSubmissionAction(submission.id, notes);
      setRejectDialogOpen(false);
      router.refresh();
    });
  }

  if (submission.status === "approved" || submission.status === "draft") {
    return null;
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {submission.status === "submitted" && (
        <Button onClick={handleStartReview} disabled={isPending} variant="outline">
          {t("startReview")}
        </Button>
      )}

      {submission.status === "under_review" && (
        <>
          <Button onClick={() => setApproveDialogOpen(true)} disabled={isPending}>
            {t("approve")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={isPending}
          >
            {t("reject")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAbortDialogOpen(true)}
            disabled={isPending}
          >
            {t("abortReview")}
          </Button>
        </>
      )}

      {submission.status === "rejected" && (
        <Button onClick={handleStartReview} disabled={isPending} variant="outline">
          {t("startReview")}
        </Button>
      )}

      {/* Abort dialog */}
      <Dialog open={abortDialogOpen} onOpenChange={setAbortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("abortReviewTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("abortReviewDesc")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbortDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleAbort} disabled={isPending}>
              {t("abortReview")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("approveTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("approveDesc")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              {t("approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">{t("rejectDesc")}</p>
          <div className="space-y-2">
            <Label>{t("notesLabel")}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Feedback…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
