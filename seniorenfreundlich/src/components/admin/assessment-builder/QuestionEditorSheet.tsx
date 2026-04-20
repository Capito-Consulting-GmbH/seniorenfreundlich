"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Question } from "@/src/validators/assessment";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Separator } from "@/src/components/ui/separator";
import { Trash2, Plus } from "lucide-react";

interface Props {
  open: boolean;
  sectionId: string;
  question: Question;
  onSave: (question: Question) => void;
  onClose: () => void;
  lang: "de" | "en";
}

export function QuestionEditorSheet({ open, question, onSave, onClose, lang }: Props) {
  const t = useTranslations("admin.assessments.builder");
  const [draft, setDraft] = useState<Question>(question);

  function update(partial: Partial<Question>) {
    setDraft((prev) => ({ ...prev, ...partial } as Question));
  }

  function updateLabel(value: string) {
    setDraft((prev) => ({ ...prev, label: { ...prev.label, [lang]: value } } as Question));
  }

  function updateDesc(value: string) {
    setDraft((prev) => ({
      ...prev,
      description: { ...(prev.description ?? { de: "", en: "" }), [lang]: value },
    } as Question));
  }

  function updatePlaceholder(value: string) {
    if (draft.type === "text" || draft.type === "textarea" || draft.type === "number") {
      setDraft((prev) => ({
        ...prev,
        placeholder: { ...((prev as { placeholder?: { de: string; en: string } }).placeholder ?? { de: "", en: "" }), [lang]: value },
      } as Question));
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("editQuestion")}</SheetTitle>
          <p className="text-xs text-muted-foreground font-mono">{draft.type}</p>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {lang === "de" ? t("labelDe") : t("labelEn")}
            </Label>
            <Input
              value={draft.label[lang]}
              onChange={(e) => updateLabel(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {lang === "de" ? t("descDe") : t("descEn")}
            </Label>
            <Input
              value={draft.description?.[lang] ?? ""}
              onChange={(e) => updateDesc(e.target.value)}
            />
          </div>

          {/* Required (not for info blocks) */}
          {draft.type !== "info" && (
            <div className="flex items-center gap-3">
              <Switch
                checked={draft.required}
                onCheckedChange={(v) => update({ required: v } as Partial<Question>)}
                id="required-toggle"
              />
              <Label htmlFor="required-toggle">{t("required")}</Label>
            </div>
          )}

          <Separator />

          {/* Placeholder (language-specific) */}
          {(draft.type === "text" || draft.type === "textarea" || draft.type === "number") && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                {lang === "de" ? t("placeholderDe") : t("placeholderEn")}
              </Label>
              <Input
                value={(draft as { placeholder?: { de: string; en: string } }).placeholder?.[lang] ?? ""}
                onChange={(e) => updatePlaceholder(e.target.value)}
              />
            </div>
          )}

          {/* Text / textarea length limits (language-independent) */}
          {(draft.type === "text" || draft.type === "textarea") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("minLength")}</Label>
                <Input
                  type="number"
                  value={(draft as { minLength?: number }).minLength ?? ""}
                  onChange={(e) => update({ minLength: e.target.value ? parseInt(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("maxLength")}</Label>
                <Input
                  type="number"
                  value={(draft as { maxLength?: number }).maxLength ?? ""}
                  onChange={(e) => update({ maxLength: e.target.value ? parseInt(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
            </div>
          )}

          {draft.type === "textarea" && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t("rows")}</Label>
              <Input
                type="number"
                value={(draft as { rows?: number }).rows ?? ""}
                onChange={(e) => update({ rows: e.target.value ? parseInt(e.target.value) : undefined } as Partial<Question>)}
              />
            </div>
          )}

          {draft.type === "number" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("min")}</Label>
                <Input
                  type="number"
                  value={(draft as { min?: number }).min ?? ""}
                  onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("max")}</Label>
                <Input
                  type="number"
                  value={(draft as { max?: number }).max ?? ""}
                  onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("step")}</Label>
                <Input
                  type="number"
                  value={(draft as { step?: number }).step ?? ""}
                  onChange={(e) => update({ step: e.target.value ? Number(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
            </div>
          )}

          {draft.type === "date" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("minDate")}</Label>
                <Input
                  type="date"
                  value={(draft as { minDate?: string }).minDate ?? ""}
                  onChange={(e) => update({ minDate: e.target.value || undefined } as Partial<Question>)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("maxDate")}</Label>
                <Input
                  type="date"
                  value={(draft as { maxDate?: string }).maxDate ?? ""}
                  onChange={(e) => update({ maxDate: e.target.value || undefined } as Partial<Question>)}
                />
              </div>
            </div>
          )}

          {draft.type === "file-upload" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("maxFiles")}</Label>
                <Input
                  type="number"
                  value={(draft as { maxFiles?: number }).maxFiles ?? ""}
                  onChange={(e) => update({ maxFiles: e.target.value ? parseInt(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("maxSizeMb")}</Label>
                <Input
                  type="number"
                  value={(draft as { maxSizeMb?: number }).maxSizeMb ?? ""}
                  onChange={(e) => update({ maxSizeMb: e.target.value ? Number(e.target.value) : undefined } as Partial<Question>)}
                />
              </div>
            </div>
          )}

          {/* Options (single/multi-choice) — option ID is language-independent, label per lang */}
          {(draft.type === "single-choice" || draft.type === "multi-choice") && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Optionen</Label>
              {(draft as { options: { value: string; label: { de: string; en: string } }[] }).options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder={lang === "de" ? t("optionValueDe") : t("optionValueEn")}
                    value={opt.label[lang]}
                    onChange={(e) => {
                      const options = [...(draft as { options: typeof opt[] }).options];
                      options[idx] = { ...opt, label: { ...opt.label, [lang]: e.target.value } };
                      update({ options } as Partial<Question>);
                    }}
                    className="text-xs h-7 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                    onClick={() => {
                      const options = (draft as { options: typeof opt[] }).options.filter(
                        (_, i) => i !== idx
                      );
                      update({ options } as Partial<Question>);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  const idx = (draft as { options: { value: string; label: { de: string; en: string } }[] }).options.length + 1;
                  const options = [
                    ...(draft as { options: { value: string; label: { de: string; en: string } }[] }).options,
                    { value: `option-${idx}`, label: { de: `Option ${idx}`, en: `Option ${idx}` } },
                  ];
                  update({ options } as Partial<Question>);
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t("addOption")}
              </Button>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={() => onSave(draft)}>Speichern</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

