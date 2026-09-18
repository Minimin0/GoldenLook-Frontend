// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateWizard } from "@/app/create/page";
import { FlyerInfoStep } from "@/components/create/FlyerInfoStep";
import type { Appearance, CaseDto } from "@/lib/schemas";

const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  routerPush: vi.fn(),
  getCase: vi.fn(),
  patchCase: vi.fn(),
  generateCase: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.routerReplace, push: mocks.routerPush }),
  useSearchParams: () => new URLSearchParams("case=case-1"),
}));

vi.mock("@/lib/api/cases", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/cases")>("@/lib/api/cases");
  return {
    ...actual,
    getCase: mocks.getCase,
    patchCase: mocks.patchCase,
    generateCase: mocks.generateCase,
  };
});

const emptyAppearance: Appearance = {
  top: { status: "unknown" },
  bottom: { status: "unknown" },
  hat: { status: "unknown" },
  shoes: { status: "unknown" },
  items: [],
};

function caseDto(appearance: Appearance = emptyAppearance): CaseDto {
  return {
    id: "case-1",
    photoMode: "body_visible",
    appearance,
    bodyProfile: null,
    age: null,
    heightCm: null,
    generationStatus: "PENDING",
    regenerationCount: 0,
    regenerationsRemaining: 3,
    originalUrl: "https://signed.example/original.jpg",
    generatedUrl: null,
    label: "AI로 재현한 예상 모습",
    published: false,
    shareId: null,
    flyerUrl: null,
    name: null,
    missingAt: null,
    place: null,
    contact: null,
    notes: null,
    contactDisclosureConsent: false,
  };
}

function setInput(input: HTMLInputElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

describe("CreateWizard belonging item persistence", () => {
  beforeEach(() => {
    mocks.routerReplace.mockReset();
    mocks.routerPush.mockReset();
    mocks.getCase.mockReset();
    mocks.patchCase.mockReset();
    mocks.generateCase.mockReset();

    mocks.getCase.mockResolvedValue(caseDto());
    mocks.patchCase.mockImplementation(async (_id: string, patch: { appearance?: Appearance }) =>
      ({
        ...caseDto(patch.appearance ?? emptyAppearance),
        generationStatus: "GENERATED",
        generatedUrl: "https://signed.example/generated.jpg",
      }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  async function renderWizard() {
    render(<CreateWizard />);
    await screen.findByText("실종 당시 옷차림을 골라 주세요");
  }

  it("blocks pending text, then PATCHes added item and keeps it in the PATCH response", async () => {
    await renderWizard();

    const input = document.querySelector<HTMLInputElement>('input[placeholder="예: 나무 지팡이"]');
    expect(input).not.toBeNull();

    setInput(input!, "검정 가방");
    expect(document.body.textContent).toContain("입력한 소지품을 추가해 주세요.");
    await waitFor(() =>
      expect((screen.getByRole("button", { name: "다음" }) as HTMLButtonElement).disabled).toBe(true),
    );

    fireEvent.click(screen.getByRole("button", { name: /추가/ }));
    expect(document.body.textContent).toContain("검정 가방");

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(mocks.patchCase).toHaveBeenCalledWith("case-1", {
      appearance: {
        ...emptyAppearance,
        items: [{ type: "검정 가방", color: null }],
      },
    }));
    await expect(mocks.patchCase.mock.results[0].value).resolves.toMatchObject({
      appearance: { items: [{ type: "검정 가방", color: null }] },
    });
  });

  it("sends colored items and excludes deleted items", async () => {
    await renderWizard();

    const input = document.querySelector<HTMLInputElement>('input[placeholder="예: 나무 지팡이"]')!;

    setInput(input, "지팡이");
    fireEvent.click(screen.getByRole("button", { name: "색도 기억나요" }));
    fireEvent.click(screen.getByRole("radio", { name: "갈색" }));
    fireEvent.click(screen.getByRole("button", { name: /추가/ }));

    setInput(input, "삭제할 우산");
    fireEvent.click(screen.getByRole("button", { name: /추가/ }));
    fireEvent.click(screen.getByRole("button", { name: "삭제할 우산 삭제" }));

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(mocks.patchCase).toHaveBeenCalledWith("case-1", {
      appearance: {
        ...emptyAppearance,
        items: [{ type: "지팡이", color: "brown" }],
      },
    }));
  });

  it("shows added items on the flyer info appearance preview", () => {
    render(
      <FlyerInfoStep
        appearance={{ ...emptyAppearance, items: [{ type: "검정 가방", color: null }] }}
        consent={false}
        form={{
          name: "",
          age: "",
          heightCm: "",
          missingAt: "",
          sido: "",
          sigungu: "",
          placeDetail: "",
          notes: "",
          contact: "",
        }}
        onChange={vi.fn()}
        onConsentChange={vi.fn()}
        onEditBodyInfo={vi.fn()}
        photoMode="body_visible"
      />,
    );

    expect(document.body.textContent).toContain("소지품");
    expect(document.body.textContent).toContain("검정 가방");
  });
});
