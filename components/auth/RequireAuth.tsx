"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * 전단 생성·수정·발행·삭제는 로그인이 필요하다. (기획서 7)
 * 공개 전단 조회(`/c/[shareId]`)는 이 컴포넌트를 쓰지 않는다.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, ready, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && configured && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, configured, session, router, pathname]);

  if (!configured) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-8 text-center">
        <h1 className="text-lg font-extrabold text-ink">로그인 설정이 필요합니다</h1>
        <p className="text-[14px] leading-relaxed text-muted">
          <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_URL</code> 과{" "}
          <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를
          <br />
          <code className="rounded bg-paper px-1">.env.local</code> 에 넣어 주세요.
        </p>
      </main>
    );
  }

  if (!ready || !session) {
    return (
      <main className="grid min-h-dvh place-items-center text-navy-500">
        <Loader2 className="animate-spin" size={26} />
        <span className="sr-only">불러오는 중</span>
      </main>
    );
  }

  return <>{children}</>;
}
