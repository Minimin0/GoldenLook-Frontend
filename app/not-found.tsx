import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-400">
        <Compass size={30} strokeWidth={1.6} />
      </span>
      <h1 className="mt-5 text-xl font-extrabold text-ink">없는 주소입니다</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        주소가 바뀌었거나 잘못 입력되었습니다.
        <br />
        홈에서 다시 시작해 주세요.
      </p>
      <ButtonLink className="mt-6" href="/" size="lg" variant="primary">
        Golden Look 홈으로
      </ButtonLink>
    </main>
  );
}
