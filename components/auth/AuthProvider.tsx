"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEMO_ACCOUNT, DEMO_AUTO_LOGIN } from "@/lib/demo-account";

/**
 * MVP 로그인은 Supabase Auth Email/Password 만 쓴다.
 * 카카오/Google 로그인은 MVP 이후다. (기획서 2.2 / 7)
 *
 * 제출용 데모에서는 `DEMO_AUTO_LOGIN` 이 켜져 있어, 세션이 없으면
 * 공용 계정으로 자동 로그인한다. (`lib/demo-account.ts`)
 */
type AuthState = {
  session: Session | null;
  email: string | null;
  ready: boolean;
  configured: boolean;
  /** 자동 로그인이 끝내 실패했을 때의 안내 문구. 평소에는 null. */
  autoLoginError: string | null;
};

const AuthContext = createContext<AuthState>({
  session: null,
  email: null,
  ready: false,
  configured: false,
  autoLoginError: null,
});

const AUTO_LOGIN_FAILED = "체험용 계정으로 접속하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/**
 * 자동 로그인이 실패를 반복할 때 무한 재시도로 도는 것을 막는다.
 * 401 → 로그아웃 → 자동 로그인 이 서로를 계속 부를 수 있다.
 */
const MAX_AUTO_LOGIN_ATTEMPTS = 3;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const autoLogin = configured && DEMO_AUTO_LOGIN;
  const [session, setSession] = useState<Session | null>(null);
  // 자동 로그인이 붙는 동안 ready 를 세우면 RequireAuth 가 로그인 화면으로 보내 버린다.
  const [ready, setReady] = useState(!configured);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);

  const attempts = useRef(0);
  const inFlight = useRef(false);

  /** 세션이 없을 때 공용 데모 계정으로 붙인다. 성공하면 onAuthStateChange 가 받는다. */
  const ensureDemoSession = useCallback(async () => {
    if (inFlight.current) return;
    if (attempts.current >= MAX_AUTO_LOGIN_ATTEMPTS) {
      setAutoLoginError(AUTO_LOGIN_FAILED);
      setReady(true);
      return;
    }

    inFlight.current = true;
    attempts.current += 1;
    const { error } = await getSupabase().auth.signInWithPassword({
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    });
    inFlight.current = false;

    if (!error) {
      setAutoLoginError(null);
      return;
    }
    setAutoLoginError(AUTO_LOGIN_FAILED);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let active = true;

    /** 세션이 없을 때 무엇을 할지 한 곳에서 정한다. */
    const handleNoSession = () => {
      if (autoLogin) {
        void ensureDemoSession();
        return;
      }
      setReady(true);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (next) {
        setReady(true);
        return;
      }
      // 로그아웃이나 세션 만료 뒤에도 데모는 로그인된 상태로 되돌아간다.
      handleNoSession();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        setReady(true);
        return;
      }
      handleNoSession();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured, autoLogin, ensureDemoSession]);

  /**
   * 서버가 401 을 돌려주면 남아 있는 세션을 버린다.
   * onAuthStateChange 가 세션 없음을 알리고, RequireAuth 가 로그인 화면으로 보낸다.
   * 데모에서는 같은 신호를 받아 공용 계정으로 다시 붙는다.
   */
  useEffect(() => {
    if (!configured) return;
    setUnauthorizedHandler(() => {
      void getSupabase().auth.signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [configured]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      email: session?.user.email ?? null,
      ready,
      configured,
      autoLoginError,
    }),
    [session, ready, configured, autoLoginError],
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
