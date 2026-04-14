import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Props = {
  /** Current active step number (1, 2, or 3). Steps below this are shown as done. */
  currentStep: number;
};

export async function OnboardingStepper({ currentStep }: Props) {
  const t = await getTranslations("dashboard.onboarding");

  const steps = [
    { number: 1, label: t("step1Label") },
    { number: 2, label: t("step2Label") },
    { number: 3, label: t("step3Label") },
  ];

  return (
    <ol className="flex items-start" aria-label="Onboarding progress">
      {steps.map((step, idx) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <li key={step.number} className="flex flex-1 items-start">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isDone &&
                    "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    "border-primary bg-background text-primary",
                  !isDone &&
                    !isActive &&
                    "border-muted-foreground/40 bg-background text-muted-foreground"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs text-center leading-tight px-1",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mt-4 h-0.5 flex-1 mx-2 transition-colors",
                  isDone ? "bg-primary" : "bg-muted"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
