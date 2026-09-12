/**
 * Tailwind CSS v3 를 쓰는 프로젝트용 설정.
 * 이 파일을 tailwind.config.ts 로 이름만 바꾸고,
 * globals.css 상단의 @import "tailwindcss" 를 @tailwind 지시문 3줄로 교체하면 됩니다.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF3FA",
          100: "#D8E4F4",
          200: "#B0C7E6",
          300: "#7FA3D4",
          400: "#4E7BBD",
          500: "#2C5A9E",
          600: "#1C447F",
          700: "#143462",
          800: "#0E2546",
          900: "#081A33",
        },
        signal: {
          50: "#FDECEA",
          100: "#FBD5D1",
          500: "#E8392B",
          600: "#C82A1E",
          700: "#9E1F16",
        },
        alert: {
          50: "#FFF3E8",
          100: "#FFE1C7",
          500: "#FF7A1A",
          600: "#E06200",
        },
        paper: "#F4F6FB",
        line: "#E3E8F0",
        ink: "#0E1B2E",
        muted: "#5A6B85",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Apple SD Gothic Neo",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "1rem",
        sheet: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
