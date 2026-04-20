import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/src/auth/isAdmin";
import { getSubmissionById } from "@/src/services/assessmentSubmissionService";
import { getConfigById } from "@/src/services/assessmentConfigService";
import { assessmentConfigSchema } from "@/src/validators/assessment";
import { Badge } from "@/src/components/ui/badge";
import { SubmissionActions } from "./SubmissionActions";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

const STATUS_VARIANTS: Record<
  string,
  "secondary" | "default" | "destructive" | "outline"
> = {
  draft: "secondary",
  submitted: "default",
  under_review: "default",
  approved: "default",
  rejected: "destructive",
};

export default async function SubmissionDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const t = await getTranslations("admin.assessments.submission");

  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  const configRow = await getConfigById(submission.configId);
  const parsedConfig = configRow
    ? assessmentConfigSchema.safeParse(configRow.config)
    : null;
  const config = parsedConfig?.success ? parsedConfig.data : null;

  const statusLabel = `status${submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase())}`;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Link
        href="/admin/assessments/submissions"
        className="text-sm text-muted-foreground hover:underline"
      >
        {t("backToList")}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={STATUS_VARIANTS[submission.status] ?? "secondary"}>
              {t(statusLabel as Parameters<typeof t>[0])}
            </Badge>
            {configRow && (
              <span className="text-xs text-muted-foreground font-mono">
                v{configRow.version}
              </span>
            )}
          </div>
        </div>
        {submission.submittedAt && (
          <p className="text-sm text-muted-foreground">
            {new Date(submission.submittedAt).toLocaleDateString("de-DE")}
          </p>
        )}
      </div>

      {/* Admin actions */}
      <SubmissionActions submission={submission} />

      {/* Answers grouped by section */}
      {config && submission.answers.length > 0 && (
        <div className="space-y-6">
          {config.sections.map((section) => {
            const sectionAnswers = submission.answers.filter((a) =>
              section.questions.some((q) => q.id === a.questionId)
            );
            if (sectionAnswers.length === 0) return null;

            return (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b">
                  <h3 className="font-semibold text-sm">{section.title.de}</h3>
                </div>
                <div className="divide-y">
                  {section.questions.map((question) => {
                    const answer = sectionAnswers.find(
                      (a) => a.questionId === question.id
                    );
                    const value = answer?.value;

                    return (
                      <div key={question.id} className="px-4 py-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {question.label.de}
                          {question.type !== "info" && question.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </p>
                        {value === undefined || value === null ? (
                          <p className="text-sm italic text-muted-foreground">—</p>
                        ) : (
                          <AnswerDisplay question={question} value={value} answer={answer} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin notes */}
      {submission.adminNotes && (
        <div className="border rounded-lg p-4 bg-muted/10">
          <p className="text-sm font-semibold mb-1">Feedback / Admin-Notizen:</p>
          <p className="text-sm whitespace-pre-wrap">{submission.adminNotes}</p>
        </div>
      )}
    </div>
  );
}

function AnswerDisplay({
  question,
  value,
  answer,
}: {
  question: { type: string; options?: { value: string; label: { de: string; en: string } }[] };
  value: unknown;
  answer: { files?: { id: string; filename: string; blobUrl: string; sizeBytes: number }[] } | undefined;
}) {
  if (question.type === "yes-no") {
    return <p className="text-sm">{value === true ? "Ja" : "Nein"}</p>;
  }
  if (question.type === "single-choice" && question.options) {
    const selected = (value as { selected?: string } | null)?.selected ?? String(value);
    const opt = question.options.find((o) => o.value === selected);
    return <p className="text-sm">{opt?.label.de ?? selected}</p>;
  }
  if (question.type === "multi-choice" && question.options) {
    const selected = (value as { selected?: string[] } | null)?.selected ?? [];
    const labels = selected.map(
      (v) => question.options?.find((o) => o.value === v)?.label.de ?? v
    );
    return (
      <ul className="list-disc list-inside text-sm space-y-0.5">
        {labels.map((l) => <li key={l}>{l}</li>)}
      </ul>
    );
  }
  if (question.type === "file-upload" && answer?.files && answer.files.length > 0) {
    return (
      <ul className="space-y-1">
        {answer.files.map((f) => (
          <li key={f.id}>
            <a
              href={f.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {f.filename}{" "}
              <span className="text-muted-foreground text-xs">
                ({(f.sizeBytes / 1024).toFixed(1)} KB)
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }
  if (question.type === "date" && typeof value === "string") {
    return <p className="text-sm">{new Date(value).toLocaleDateString("de-DE")}</p>;
  }
  if (typeof value === "string" || typeof value === "number") {
    return <p className="text-sm whitespace-pre-wrap">{String(value)}</p>;
  }
  return <p className="text-sm font-mono text-xs">{JSON.stringify(value)}</p>;
}
