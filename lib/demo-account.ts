/**
 * 제출용 공개 데모 설정.
 *
 * 심사에서는 로그인·회원가입 단계 없이 바로 전단을 만들어 볼 수 있어야 해서,
 * 세션이 없으면 아래 공용 계정으로 자동 로그인한다.
 * 로그인 화면(`/login`)과 `RequireAuth` 는 그대로 두고 입구만 감춰서,
 * `DEMO_AUTO_LOGIN` 을 `false` 로 되돌리면 원래 로그인 흐름이 그대로 살아난다.
 *
 * 주의
 * - 이 계정은 브라우저 번들에 그대로 들어간다. 공개된 계정으로 취급한다.
 * - 이 비밀번호를 다른 서비스나 실제 계정에 쓰지 않는다.
 * - 방문자가 모두 같은 계정을 쓰므로 `/my` 목록도 공유된다. 실제 인물 사진이나
 *   실제 연락처를 넣지 않는다.
 * - 제출이 끝나면 `DEMO_AUTO_LOGIN` 을 `false` 로 되돌린다.
 */
export const DEMO_AUTO_LOGIN = true;

export const DEMO_ACCOUNT = {
  email: "goldenlook-e2e-a@example.com",
  password: "123456",
} as const;

/**
 * 로그인이 필요한 경로로 보내는 링크.
 * 데모에서는 로그인 화면을 거치지 않고 바로 들여보낸다.
 */
export function authedHref(path: string, hasSession: boolean) {
  if (DEMO_AUTO_LOGIN || hasSession) return path;
  return `/login?next=${encodeURIComponent(path)}`;
}
