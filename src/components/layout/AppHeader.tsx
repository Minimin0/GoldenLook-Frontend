import Link from "next/link";
import { Bell } from "lucide-react";

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[10px] bg-navy-800 font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      G
    </span>
  );
}

export function AppHeader({ unreadCount = 0 }: { unreadCount?: number }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-5 py-3.5">
      <Link href="/" className="flex items-center gap-2.5">
        <BrandMark />
        <span className="text-lg font-extrabold tracking-tight text-navy-800">GoldenLook</span>
      </Link>

      <Link
        href="/my"
        className="relative grid size-10 place-items-center rounded-full text-navy-700 hover:bg-navy-50"
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}건` : "알림"}
      >
        <Bell size={21} strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-signal-500 ring-2 ring-white" />
        )}
      </Link>
    </header>
  );
}
