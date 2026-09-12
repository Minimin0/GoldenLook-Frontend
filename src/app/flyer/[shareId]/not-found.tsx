import { FileX2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function FlyerNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-400">
        <FileX2 size={30} strokeWidth={1.6} />
      </span>
      <h1 className="mt-5 text-xl font-extrabold text-ink">이미 내려간 전단지입니다</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        수색이 끝났거나, 등록 후 48시간이 지나 자동으로 삭제되었습니다.
        <br />
        링크를 다시 확인해 주세요.
      </p>
      <ButtonLink href="/" className="mt-6" size="lg" variant="primary">
        GoldenLook 홈으로
      </ButtonLink>
    </main>
  );
}
