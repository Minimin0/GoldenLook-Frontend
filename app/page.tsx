export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center gap-8">
        <div>
          <p className="text-sm font-semibold text-red-700">Golden Look</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">
            실종 전단을 더 빠르고 정확하게 만듭니다.
          </h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            보호자가 확인한 옷차림 정보만 사용하고, 원본 사진을 항상 함께 보여주는 모바일 전단 MVP입니다.
          </p>
        </div>
        <div className="grid gap-3">
          <a className="flex h-12 items-center justify-center rounded-md bg-red-700 px-4 font-semibold text-white" href="/new">
            가상 인물로 30초 체험하기
          </a>
          <a className="flex h-12 items-center justify-center rounded-md border border-stone-300 bg-white px-4 font-semibold" href="/new">
            사진으로 직접 만들어보기
          </a>
        </div>
      </section>
    </main>
  );
}
