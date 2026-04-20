"use client";

import { useRouter } from "@/src/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Plus } from "lucide-react";
import { createConfigAction } from "@/src/actions/admin/adminAssessmentActions";

type Tier = "basic" | "standard" | "premium";

export function CreateConfigButton() {
  const t = useTranslations("admin.assessments");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<Tier>("basic");

  function handleCreate() {
    startTransition(async () => {
      const result = await createConfigAction(
        { de: "Neuer Fragebogen", en: "New Questionnaire" },
        tier
      );
      if (result.configId) {
        setOpen(false);
        router.push(`/admin/assessments/builder/${result.configId}`);
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        {t("newConfig")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("newConfig")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="tier-select">{t("tierLabel")}</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
              <SelectTrigger id="tier-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">{t("tierBasic")}</SelectItem>
                <SelectItem value="standard">{t("tierStandard")}</SelectItem>
                <SelectItem value="premium">{t("tierPremium")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "…" : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
