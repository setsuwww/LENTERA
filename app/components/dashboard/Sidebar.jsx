
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Layers,
  ChartNoAxesCombined,
  RotateCcw,
  History,
  UserRound,
  Search,
} from "lucide-react";

const menuConfig = {
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Book Collection", href: "/dashboard/admin/books", icon: BookOpen },
    { label: "Members", href: "/dashboard/admin/members", icon: Users },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: ArrowLeftRight },
    { label: "Categories", href: "/dashboard/admin/categories", icon: Layers },
    { label: "Reports", href: "/dashboard/admin/reports", icon: ChartNoAxesCombined },
  ],

  staff: [
    { label: "Overview", href: "/dashboard/staff", icon: LayoutDashboard },
    { label: "Book Collection", href: "/dashboard/staff/books", icon: BookOpen },
    { label: "Members", href: "/dashboard/staff/members", icon: Users },
    { label: "Transactions", href: "/dashboard/staff/transactions", icon: ArrowLeftRight },
    { label: "Book Returns", href: "/dashboard/staff/returns", icon: RotateCcw },
  ],

  student: [
    { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Explore Books", href: "/dashboard/student/catalog", icon: Search },
    { label: "My Loans", href: "/dashboard/student/loans", icon: BookOpen },
    { label: "History", href: "/dashboard/student/history", icon: History },
    { label: "My Profile", href: "/dashboard/student/profile", icon: UserRound },
  ],
};

const roleLabels = {
  admin: "Administration",
  staff: "Library Operations",
  student: "Student Portal",
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const menus = menuConfig[role] || [];

  return (
    <aside className="w-full md:w-[250px] shrink-0 bg-[#214c3a] text-white flex flex-col md:min-h-screen">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-white/40 grid place-items-center font-serif text-2xl">
            L.
          </div>

          <div>
            <h1 className="font-bold tracking-[3px] text-sm">
              LENTERA
            </h1>

            <p className="text-[9px] text-[#c8d5c9] tracking-widest mt-1">
              CAMPUS LIBRARY
            </p>
          </div>
        </div>
      </div>

      <div className="px-7 mb-5 hidden md:block">
        <span className="text-[9px] tracking-[2px] text-[#a8bbae]">
          {roleLabels[role]}
        </span>
      </div>

      <nav className="flex md:flex-col gap-1 px-3 pb-4 overflow-x-auto md:overflow-visible">
        {menus.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-md text-xs transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-[#c8d5c9] hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:block mt-auto p-7 border-t border-white/15">
        <p className="text-[9px] tracking-widest text-[#c8d5c9]">
          LIBRARY MANAGEMENT
        </p>

        <p className="text-[10px] text-[#a8bbae] mt-2">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}
