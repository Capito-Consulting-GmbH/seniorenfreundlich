"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import { Save, Globe } from "lucide-react";

interface Props {
  onSaveDraft: () => void;
  onPublish: () => void;
  isPending: boolean;
  saveMsg: string | null;
  canPublish: boolean;
  isReadOnly: boolean;
}

export function BuilderToolbar({
  onSaveDraft,
  onPublish,
  isPending,
  saveMsg,
  canPublish,
  isReadOnly,
}: Props) {
  const t = useTranslations("admin.assessments.builder");

  return (
    <div className="border-t px-4 py-3 flex items-center justify-between bg-background">
      <span className="text-xs text-muted-foreground h-4">
        {saveMsg ?? ""}
      </span>
      <div className="flex gap-2">
        {!isReadOnly && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isPending}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isPending ? t("saving") : t("saveDraft")}
            </Button>
            {canPublish && (
              <Button size="sm" onClick={onPublish} disabled={isPending}>
                <Globe className="h-4 w-4 mr-1.5" />
                {t("publish")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
