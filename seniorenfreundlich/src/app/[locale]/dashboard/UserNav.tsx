"use client";

import { useRouter, Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "@/src/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";

export function DashboardUserNav() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const router = useRouter();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  function handleSignOut() {
    signOut({ fetchOptions: { onSuccess: () => router.push("/") } });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-full border text-xs font-semibold"
          aria-label="User menu"
        >
          {initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user && (
          <>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/security">{t("account")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
