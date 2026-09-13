"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, House, SquarePen } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "홈", icon: House },
  { href: "/create", label: "전단 작성", icon: SquarePen },
  { href: "/my", label: "내 전단", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="app-bar border-t border-line bg-white/95 backdrop-blur"
    >
      <ul className="flex items-stretch pb-[env(safe-area-inset-bottom,0px)]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[68px] flex-col items-center justify-center gap-1 text-xs font-semibold",
                  active ? "text-navy-800" : "text-muted",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
