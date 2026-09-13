"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ErrorText, LabeledInput } from "@/components/ui/Field";
import { signIn, signUp, useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { session, ready, configured } = useAuth();

  const next = params.get("next") || "/my";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace(next);
  }, [ready, session, router, next]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        const { needsEmailConfirm } = await signUp(email.trim(), password);
        if (needsEmailConfirm) {
          setConfirmSent(true);
          return;
        }
      }
      router.replace(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "로그인하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <main className="px-5 py-10">
        <h1 className="text-xl font-extrabold text-ink">로그인 설정이 필요합니다</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_URL</code> 과{" "}
          <code className="rounded bg-paper px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를{" "}
          <code className="rounded bg-paper px-1">.env.local</code> 에 넣어 주세요.
        </p>
      </main>
    );
  }

  if (confirmSent) {
    return (
      <main className="flex flex-col items-center px-6 py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-500">
          <MailCheck size={30} strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-xl font-extrabold text-ink">인증 메일을 보냈습니다</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {email} 로 보낸 메일에서 인증을 마친 뒤<br />
          다시 로그인해 주세요.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            setConfirmSent(false);
            setMode("signin");
          }}
          size="lg"
        >
          로그인하러 가기
        </Button>
      </main>
    );
  }

  return (
    <main className="px-5 pb-16 pt-6">
      <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-ink">
        {mode === "signin" ? "다시 오셨네요" : "먼저 계정을 만들어 주세요"}
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
        전단을 만들고 관리하려면 로그인이 필요합니다. 만든 전단은 본인만 수정·삭제할 수 있습니다.
      </p>

      <div className="mt-5 flex gap-1.5 rounded-xl bg-paper p-1">
        {(["signin", "signup"] as const).map((value) => (
          <button
            className={cn(
              "h-10 flex-1 rounded-lg text-[14px] font-bold transition-colors",
              mode === value ? "bg-white text-navy-800 shadow-sm" : "text-muted",
            )}
            key={value}
            onClick={() => {
              // 탭을 바꾸면 앞 탭에 치던 값을 비운다.
              // 로그인 칸에 남은 값이 회원가입 폼에 그대로 보이면 실수로 가입된다.
              if (mode === value) return;
              setMode(value);
              setError(null);
              setEmail("");
              setPassword("");
            }}
            type="button"
          >
            {value === "signin" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      <form className="mt-5 space-y-3" onSubmit={submit}>
        <LabeledInput
          inputMode="email"
          label="이메일"
          onChange={setEmail}
          placeholder="guardian@example.com"
          type="email"
          value={email}
        />
        <LabeledInput
          hint={mode === "signup" ? "6자 이상으로 정해 주세요." : undefined}
          label="비밀번호"
          onChange={setPassword}
          placeholder="••••••••"
          type="password"
          value={password}
        />

        <ErrorText>{error}</ErrorText>

        <Button
          disabled={busy || !email.trim() || password.length < 6}
          fullWidth
          size="lg"
          type="submit"
        >
          {busy && <Loader2 className="animate-spin" size={19} />}
          {mode === "signin" ? "로그인" : "가입하고 시작하기"}
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] leading-relaxed text-muted">
        카카오·구글 로그인은 준비 중입니다. 지금은 이메일로만 가입할 수 있습니다.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHeader title="로그인" fallbackHref="/" />
      <Suspense
        fallback={
          <main className="grid min-h-[50dvh] place-items-center text-navy-500">
            <Loader2 className="animate-spin" size={24} />
          </main>
        }
      >
        <LoginForm />
      </Suspense>
    </>
  );
}
