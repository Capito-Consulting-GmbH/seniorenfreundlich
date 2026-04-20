import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getActiveConfig } from "@/src/services/assessmentConfigService";
import { getSubmissionByCompany } from "@/src/services/assessmentSubmissionService";
import { getSubmissionById } from "@/src/services/assessmentSubmissionService";
import { assessmentConfigSchema } from "@/src/validators/assessment";
import { AssessmentWizard } from "./AssessmentWizard";
import { AssessmentStatus } from "./AssessmentStatus";
import { AssessmentReadOnly } from "@/src/components/assessment/AssessmentReadOnly";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("assessment");

  const company = await getCurrentCompany().catch(() => null);
  if (!company) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">{t("noConfig")}</p>
      </div>
    );
  }

  const activeConfig = await getActiveConfig();
  if (!activeConfig) {
    return (
      <div className="p-6 space-y-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("noConfigDesc")}</p>
      </div>
    );
  }

  const parsedConfig = assessmentConfigSchema.safeParse(activeConfig.config);
  if (!parsedConfig.success) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">Config error.</p>
      </div>
    );
  }

  // Find existing submission (any status — not just draft)
  const latestSubmission = await getSubmissionByCompany(company.id);

  // If submission is not in editable state (draft), show status + read-only view
  if (
    latestSubmission &&
    latestSubmission.status !== "draft"
  ) {
    const submission = await getSubmissionById(latestSubmission.id);
    const parsedConfigForReadOnly = assessmentConfigSchema.safeParse(activeConfig.config);

    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
        <AssessmentStatus
          submission={latestSubmission}
          locale={locale as "de" | "en"}
        />
        {parsedConfigForReadOnly.success && submission && submission.answers.length > 0 && (
          <AssessmentReadOnly
            config={parsedConfigForReadOnly.data}
            answers={submission.answers}
            locale={locale as "de" | "en"}
          />
        )}
      </div>
    );
  }

  // Load full submission with answers for wizard
  const submission = latestSubmission
    ? await getSubmissionById(latestSubmission.id)
    : null;

  // Build answer map from existing answers
  const answerMap: Record<string, unknown> = {};
  if (submission) {
    for (const answer of submission.answers) {
      answerMap[answer.questionId] = answer.value;
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("subtitle")}</p>
      <AssessmentWizard
        config={parsedConfig.data}
        configId={activeConfig.id}
        submissionId={submission?.id ?? null}
        initialAnswers={answerMap}
        locale={locale as "de" | "en"}
      />
    </div>
  );
}
