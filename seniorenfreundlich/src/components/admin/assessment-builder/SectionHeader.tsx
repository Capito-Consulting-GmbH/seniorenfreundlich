"use client";

import { useTranslations } from "next-intl";
import type { AssessmentSection } from "@/src/validators/assessment";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  section: AssessmentSection;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpdate: (update: Partial<AssessmentSection>) => void;
  onDelete: () => void;
  disabled?: boolean;
  lang: "de" | "en";
}

export function SectionHeader({
  section,
  isCollapsed,
  onToggleCollapse,
  onUpdate,
  onDelete,
  disabled,
  lang,
}: Props) {
  const t = useTranslations("admin.assessments.builder");

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/10 rounded-t-lg">
      {!disabled && (
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 shrink-0"
        onClick={onToggleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1">
        <Input
          value={section.title[lang]}
          onChange={(e) =>
            onUpdate({ title: { ...section.title, [lang]: e.target.value } })
          }
          placeholder={lang === "de" ? t("sectionTitleDe") : t("sectionTitleEn")}
          disabled={disabled}
          className="h-7 text-sm font-medium"
        />
      </div>

      {!disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
          onClick={onDelete}
          title={t("deleteSection")}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
