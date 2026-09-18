import { afterEach, describe, expect, it, vi } from "vitest";
import { patchCase } from "@/lib/api/cases";

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    auth: {
      getSession: async () => ({ data: { session: { access_token: "test-token" } } }),
    },
  }),
}));

describe("cases API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("PATCH keeps appearance.items in the JSON body", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://backend.example");

    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await patchCase("case-1", {
      appearance: {
        top: { status: "unknown" },
        bottom: { status: "unknown" },
        hat: { status: "unknown" },
        shoes: { status: "unknown" },
        items: [{ type: "지팡이", color: "brown" }],
      },
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      appearance: {
        top: { status: "unknown" },
        bottom: { status: "unknown" },
        hat: { status: "unknown" },
        shoes: { status: "unknown" },
        items: [{ type: "지팡이", color: "brown" }],
      },
    });
  });
});
