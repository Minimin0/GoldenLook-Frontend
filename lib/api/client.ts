import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/** Backend `lib/server/http.ts` 의 ErrorCode 와 같은 목록 */
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "GENERATION_LIMIT"
  | "DAILY_GENERATION_LIMIT"
  | "GENERATION_IN_PROGRESS"
  | "CASE_PUBLISHED"
  | "AI_TEMPORARY_ERROR"
  | "UPLOAD_FAILED"
  | "CONFIGURATION"
  | "INTERNAL"
  | "NETWORK";

const FALLBACK_MESSAGE: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: "로그인이 필요합니다.",
  NOT_FOUND: "요청한 항목을 찾을 수 없습니다.",
  INVALID_INPUT: "입력값을 확인해주세요.",
  GENERATION_LIMIT: "재생성 가능 횟수를 모두 사용했습니다.",
  DAILY_GENERATION_LIMIT: "오늘 생성 가능 횟수를 모두 사용했습니다.",
  GENERATION_IN_PROGRESS: "이미지 생성이 진행 중입니다.",
  CASE_PUBLISHED: "발행된 전단은 삭제 외 변경할 수 없습니다.",
  AI_TEMPORARY_ERROR: "잠시 후 다시 시도해주세요.",
  UPLOAD_FAILED: "이미지 업로드에 실패했습니다.",
  CONFIGURATION: "서버 설정이 필요합니다.",
  INTERNAL: "요청을 처리하지 못했습니다.",
  NETWORK: "서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
};

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public status = 0,
    message = FALLBACK_MESSAGE[code],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * provider/일시 오류는 재생성 횟수에서 차감되지 않는다. (기획서 5.4)
 * 화면에서 "다시 시도" 를 권할지 판단할 때 쓴다.
 */
export function isRetryable(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.code === "AI_TEMPORARY_ERROR" || error.code === "INTERNAL" || error.code === "NETWORK")
  );
}

/**
 * 서버가 401 을 돌려줬을 때 부를 콜백.
 *
 * 브라우저에 세션이 남아 있어도 서버 기준으로는 만료·폐기됐을 수 있다.
 * 그 상태를 방치하면 로그인한 것처럼 보이는 채로 모든 요청이 실패하고
 * 사용자는 빠져나갈 방법이 없다. AuthProvider 가 여기에 로그아웃을 걸어 둔다.
 */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}

async function accessToken() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await getSupabase().auth.getSession();
  return data.session?.access_token ?? null;
}

type RequestOptions = {
  method?: string;
  body?: BodyInit | null;
  json?: unknown;
  /** 로그인 토큰을 붙인다. 공개 전단 조회만 false 로 둔다. */
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", json, body, auth = true, signal } = options;
  const headers = new Headers();

  if (auth) {
    const token = await accessToken();
    if (!token) {
      unauthorizedHandler?.();
      throw new ApiError("UNAUTHORIZED", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (json !== undefined) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers,
      body: json !== undefined ? JSON.stringify(json) : body,
      signal,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("NETWORK");
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const code = (payload?.code ?? "INTERNAL") as ApiErrorCode;
    if (response.status === 401 || code === "UNAUTHORIZED") unauthorizedHandler?.();
    throw new ApiError(
      code in FALLBACK_MESSAGE ? code : "INTERNAL",
      response.status,
      payload?.error || FALLBACK_MESSAGE[code] || FALLBACK_MESSAGE.INTERNAL,
    );
  }
  return payload as T;
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return FALLBACK_MESSAGE.INTERNAL;
}
