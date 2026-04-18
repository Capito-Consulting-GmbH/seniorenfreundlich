"use client";

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
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/companies", label: t("companies"), icon: Building2 },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingCart },
    { href: "/admin/badges", label: t("badges"), icon: Award },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/audit", label: t("auditLog"), icon: ScrollText },
  ];

  function isActive(href: string, exact?: boolean) {
    // Strip locale prefix for matching
    const normalized = pathname.replace(/^\/(de|en)/, "") || "/";
    if (exact) return normalized === href;
    return normalized.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/20 min-h-screen hidden lg:block">
      <div className="px-3 py-4 border-b">
        <div className="flex items-center gap-2 px-2 py-1">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">{t("adminPanel")}</span>
        </div>
      </div>
      <nav className="px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
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
        })}
      </nav>
    </aside>
  );
}
