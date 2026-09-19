"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

/**
 * 전단 생성·수정·발행·삭제는 로그인이 필요하다. (기획서 7)
 * 공개 전단 조회(`/c/[shareId]`)는 이 컴포넌트를 쓰지 않는다.
 *
 * 데모 자동 로그인이 켜져 있으면 세션은 AuthProvider 가 붙여 주므로
 * 여기서는 붙을 때까지 기다리기만 한다. (`lib/demo-account.ts`)
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, ready, configured, autoLoginError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 자동 로그인이 실패한 경우에는 로그인 화면 대신 아래 안내를 보여 준다.
    if (ready && configured && !session && !autoLoginError) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, configured, session, autoLoginError, router, pathname]);

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

  // 자동 로그인이 끝내 실패하면 빈 화면에 갇히지 않게 다시 시도할 길을 준다.
  if (autoLoginError && !session) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-8 text-center">
        <h1 className="text-lg font-extrabold text-ink">지금은 들어갈 수 없습니다</h1>
        <p className="text-[14px] leading-relaxed text-muted">{autoLoginError}</p>
        <Button className="mt-4" onClick={() => window.location.reload()} size="lg">
          다시 시도
        </Button>
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
