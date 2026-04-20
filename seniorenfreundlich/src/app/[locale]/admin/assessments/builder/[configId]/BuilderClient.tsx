"use client";

import { useReducer, useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import type {
  AssessmentConfig,
  AssessmentSection,
  Question,
} from "@/src/validators/assessment";
import type { Action } from "@/src/components/admin/assessment-builder/types";
import {
  saveConfigDraftAction,
  publishConfigAction,
} from "@/src/actions/admin/adminAssessmentActions";
import { SortableSectionList } from "@/src/components/admin/assessment-builder/SortableSectionList";
import { BuilderToolbar } from "@/src/components/admin/assessment-builder/BuilderToolbar";
import { AssessmentPreview } from "@/src/components/admin/assessment-builder/AssessmentPreview";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { PlusCircle } from "lucide-react";

type BuilderState = {
  config: AssessmentConfig;
  title: { de: string; en: string };
};

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: action.config };
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "ADD_SECTION": {
      const id = `section-${Date.now()}`;
      return {
        ...state,
        config: {
          sections: [
            ...state.config.sections,
            { id, title: { de: "Neuer Abschnitt", en: "New Section" }, questions: [] },
          ],
        },
      };
    }
    case "REMOVE_SECTION":
      return {
        ...state,
        config: {
          sections: state.config.sections.filter((s) => s.id !== action.sectionId),
        },
      };
    case "UPDATE_SECTION":
      return {
        ...state,
        config: {
          sections: state.config.sections.map((s) =>
            s.id === action.sectionId ? { ...s, ...action.update } : s
          ),
        },
      };
    case "REORDER_SECTIONS": {
      const sections = [...state.config.sections];
      const [moved] = sections.splice(action.fromIndex, 1);
      sections.splice(action.toIndex, 0, moved);
      return { ...state, config: { sections } };
    }
    case "ADD_QUESTION":
      return {
        ...state,
        config: {
          sections: state.config.sections.map((s) =>
            s.id === action.sectionId
              ? { ...s, questions: [...s.questions, action.question] }
              : s
          ),
        },
      };
    case "REMOVE_QUESTION":
      return {
        ...state,
        config: {
          sections: state.config.sections.map((s) =>
            s.id === action.sectionId
              ? { ...s, questions: s.questions.filter((q) => q.id !== action.questionId) }
              : s
          ),
        },
      };
    case "UPDATE_QUESTION":
      return {
        ...state,
        config: {
          sections: state.config.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  questions: s.questions.map((q) =>
                    q.id === action.question.id ? action.question : q
                  ),
                }
              : s
          ),
        },
      };
    case "REORDER_QUESTIONS":
      return {
        ...state,
        config: {
          sections: state.config.sections.map((s) => {
            if (s.id !== action.sectionId) return s;
            const questions = [...s.questions];
            const [moved] = questions.splice(action.fromIndex, 1);
            questions.splice(action.toIndex, 0, moved);
            return { ...s, questions };
          }),
        },
      };
    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BuilderClientProps {
  configId: string;
  initialConfig: AssessmentConfig;
  initialTitle: { de: string; en: string };
  status: string;
  version: number;
}

export function BuilderClient({
  configId,
  initialConfig,
  initialTitle,
  status,
  version,
}: BuilderClientProps) {
  const t = useTranslations("admin.assessments.builder");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<"de" | "en">("de");

  const [state, dispatch] = useReducer(reducer, {
    config: initialConfig,
    title: initialTitle,
  });

  const isReadOnly = status === "archived";

  function handleSaveDraft() {
    startTransition(async () => {
      const result = await saveConfigDraftAction(configId, state.title, state.config);
      setSaveMsg(result.error ?? t("saved"));
      setTimeout(() => setSaveMsg(null), 3000);
    });
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishConfigAction(configId);
      if (result.error) {
        setSaveMsg(result.error);
      } else {
        router.push("/admin/assessments");
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center gap-4">
        {/* Language toggle */}
        <div className="flex rounded-md border overflow-hidden shrink-0">
          <Button
            variant={lang === "de" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3 text-xs font-semibold"
            onClick={() => setLang("de")}
          >
            DE
          </Button>
          <Button
            variant={lang === "en" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-l h-8 px-3 text-xs font-semibold"
            onClick={() => setLang("en")}
          >
            EN
          </Button>
        </div>

        <div className="flex-1 space-y-0.5">
          <Label className="text-xs text-muted-foreground">
            {lang === "de" ? t("configTitleDe") : t("configTitleEn")}
          </Label>
          <Input
            value={state.title[lang]}
            onChange={(e) =>
              dispatch({ type: "SET_TITLE", title: { ...state.title, [lang]: e.target.value } })
            }
            disabled={isReadOnly}
            className="h-8 text-sm w-80"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {t("versionLabel", { version })}
        </span>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Builder (left ~60%) */}
        <div className="w-[60%] border-r flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <SortableSectionList
              sections={state.config.sections}
              dispatch={dispatch}
              disabled={isReadOnly}
              lang={lang}
            />
            {!isReadOnly && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => dispatch({ type: "ADD_SECTION" })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t("addSection")}
              </Button>
            )}
          </div>
          <BuilderToolbar
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isPending={isPending}
            saveMsg={saveMsg}
            canPublish={status === "draft"}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Preview (right ~40%) */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            {t("preview")}
          </h3>
          <AssessmentPreview config={state.config} locale={lang} />
        </div>
      </div>
    </div>
  );
}
