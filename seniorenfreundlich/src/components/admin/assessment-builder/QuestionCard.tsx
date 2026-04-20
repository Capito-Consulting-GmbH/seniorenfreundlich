"use client";

import { useTranslations } from "next-intl";
import type { Question, QuestionType } from "@/src/validators/assessment";
import { Button } from "@/src/components/ui/button";
import {
  Pencil,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  ToggleLeft,
  CircleDot,
  CheckSquare,
  Hash,
  Paperclip,
  Calendar,
  Info,
  type LucideIcon,
} from "lucide-react";

const TYPE_ICONS: Record<QuestionType, LucideIcon> = {
  text: Type,
  textarea: AlignLeft,
  "yes-no": ToggleLeft,
  "single-choice": CircleDot,
  "multi-choice": CheckSquare,
  number: Hash,
  "file-upload": Paperclip,
  date: Calendar,
  info: Info,
};

interface Props {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function QuestionCard({ question, onEdit, onDelete, disabled }: Props) {
  const t = useTranslations("admin.assessments.builder");
  const Icon = TYPE_ICONS[question.type];
  const label = question.label.de || question.label.en || "(Kein Label)";

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded border bg-muted/30 hover:bg-muted/50 group">
      {!disabled && (
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
      )}
      <span className="flex items-center justify-center bg-primary/10 text-primary rounded px-1.5 py-0.5 shrink-0 w-7 h-6">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-sm flex-1 truncate">{label}</span>
      {question.type !== "info" && (
        <span className="text-xs text-muted-foreground shrink-0">
          {question.required ? "✱" : ""}
        </span>
      )}
      {!disabled && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit} title={t("editQuestion")}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={onDelete} title={t("deleteQuestion")}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

