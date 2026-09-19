"use client";

import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { signOut, useAuth } from "@/components/auth/AuthProvider";
import { DEMO_AUTO_LOGIN } from "@/lib/demo-account";

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

export function AppHeader() {
  const { session, ready, configured } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-5 py-3.5">
      <Link href="/" className="flex items-center gap-2.5">
        <BrandMark />
        <span className="text-lg font-extrabold tracking-tight text-navy-800">Golden Look</span>
      </Link>

      {/* 데모에서는 항상 로그인된 상태라 로그인·로그아웃 버튼을 두지 않는다. */}
      {DEMO_AUTO_LOGIN ? null : configured && ready && session ? (
        <button
          className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-navy-700 hover:bg-navy-50"
          onClick={() => void signOut()}
          type="button"
        >
          <LogOut size={17} />
          로그아웃
        </button>
      ) : (
        <Link
          className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-navy-700 hover:bg-navy-50"
          href="/login"
        >
          <LogIn size={17} />
          로그인
        </Link>
      )}
    </header>
  );
}
