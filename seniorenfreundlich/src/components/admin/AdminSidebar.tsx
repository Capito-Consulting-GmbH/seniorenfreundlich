"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Award,
  Users,
  ScrollText,
  Shield,
  ClipboardCheck,
  Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/companies", label: t("companies"), icon: Building2 },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingCart },
    { href: "/admin/badges", label: t("badges"), icon: Award },
    { href: "/admin/assessments", label: t("assessments"), icon: ClipboardCheck },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/audit", label: t("auditLog"), icon: ScrollText },
  ];

  function isActive(href: string, exact?: boolean) {
    const normalized = pathname.replace(/^\/(de|en)/, "") || "/";
    if (exact) return normalized === href;
    return normalized.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-56 shrink-0 border-r bg-muted/20 min-h-screen hidden lg:block">
        <div className="px-3 py-4 border-b">
          <div className="flex items-center gap-2 px-2 py-1">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{t("adminPanel")}</span>
          </div>
        </div>
        <nav className="px-2 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href, item.exact)} />
          ))}
        </nav>
      </aside>

      {/* Mobile hamburger + Sheet */}
      <MobileNav navItems={navItems} isActive={isActive} t={t} />
    </>
  );
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function MobileNav({
  navItems,
  isActive,
  t,
}: {
  navItems: { href: string; label: string; icon: React.ElementType; exact?: boolean }[];
  isActive: (href: string, exact?: boolean) => boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg border bg-background"
          aria-label="Navigation öffnen"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="px-3 py-4 border-b">
          <div className="flex items-center gap-2 px-2 py-1">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{t("adminPanel")}</span>
          </div>
        </div>
        <nav className="px-2 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href, item.exact)}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
