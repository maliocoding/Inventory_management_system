"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  Logs,
  MapPinned,
  PackagePlus,
  ScanLine,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type AppNavLinksProps = {
  items: NavItem[];
};

const iconByHref = {
  "/dashboard": LayoutDashboard,
  "/movements": Logs,
  "/locations": MapPinned,
  "/audit": ShieldCheck,
  "/products": Boxes,
  "/categories": Tag,
  "/products/new": PackagePlus,
  "/transactions/new": ScanLine,
} as const;

export function AppNavLinks({ items }: AppNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
      {items.map((item) => {
        const Icon = iconByHref[item.href as keyof typeof iconByHref] ?? LayoutDashboard;
        const isProductsRoot = item.href === "/products";
        const isProductDetail = /^\/products\/[^/]+$/.test(pathname);
        const isActive = isProductsRoot
          ? pathname === item.href || isProductDetail
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
              isActive
                ? "text-white shadow-sm"
                : "border border-border/70 bg-card/60 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground hover:scale-[1.02]",
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.58 0.20 190))",
                    boxShadow: "0 2px 8px oklch(0.55 0.22 265 / 0.35)",
                  }
                : undefined
            }
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-primary",
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
