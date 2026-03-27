"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  TargetIcon,
  ArchiveIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/tasks", label: "Tasks", icon: CheckSquareIcon },
  { href: "/objectives", label: "Strategy", icon: TargetIcon },
  { href: "/archive", label: "Archive", icon: ArchiveIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav z-50">
      <div className="flex items-center justify-around px-2 pt-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
