"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * MVP 로그인은 Supabase Auth Email/Password 만 쓴다.
 * 카카오/Google 로그인은 MVP 이후다. (기획서 2.2 / 7)
 */
type AuthState = {
  session: Session | null;
  email: string | null;
  ready: boolean;
  configured: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  email: null,
  ready: false,
  configured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured]);

  const value = useMemo<AuthState>(
    () => ({ session, email: session?.user.email ?? null, ready, configured }),
    [session, ready, configured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signIn(email: string, password: string) {
  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(translate(error.message));
}

/** 이메일 확인이 켜진 프로젝트에서는 session 이 없이 돌아온다. */
export async function signUp(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw new Error(translate(error.message));
  return { needsEmailConfirm: !data.session };
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

function translate(message: string) {
  const lowered = message.toLowerCase();
  if (lowered.includes("invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않습니다.";
  if (lowered.includes("already registered")) return "이미 가입된 이메일입니다. 로그인해 주세요.";
  if (lowered.includes("password should be")) return "비밀번호는 6자 이상으로 정해 주세요.";
  if (lowered.includes("email rate limit")) return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  if (lowered.includes("unable to validate email")) return "이메일 주소를 확인해 주세요.";
  return message;
}
