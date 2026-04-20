"use client";

import { useTranslations } from "next-intl";
import type { QuestionType } from "@/src/validators/assessment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import {
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

interface QuestionTypeInfo {
  type: QuestionType;
  Icon: LucideIcon;
}

const QUESTION_TYPES: QuestionTypeInfo[] = [
  { type: "text", Icon: Type },
  { type: "textarea", Icon: AlignLeft },
  { type: "yes-no", Icon: ToggleLeft },
  { type: "single-choice", Icon: CircleDot },
  { type: "multi-choice", Icon: CheckSquare },
  { type: "number", Icon: Hash },
  { type: "file-upload", Icon: Paperclip },
  { type: "date", Icon: Calendar },
  { type: "info", Icon: Info },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
}

export function QuestionTypePicker({ open, onClose, onSelect }: Props) {
  const t = useTranslations("questionTypes");
  const tBuilder = useTranslations("admin.assessments.builder");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{tBuilder("pickType")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 py-2">
          {QUESTION_TYPES.map(({ type, Icon }) => (
            <Button
              key={type}
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => onSelect(type)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-xs font-medium">{t(type)}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

