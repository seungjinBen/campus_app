import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#111827",
          mid: "#6B7280",
          light: "#9CA3AF",
          rose: "#F97066",
          "rose-light": "#FEF2F0",
          cream: "#F8F8FA",
          warm: "#F3F4F6",
          sand: "#E5E7EB",
        },
      },
      boxShadow: {
        card: "0 1px 8px 0 rgba(0,0,0,0.06)",
        "card-lg": "0 4px 20px 0 rgba(0,0,0,0.10)",
        modal: "0 8px 40px 0 rgba(0,0,0,0.12)",
      },
      transitionTimingFunction: {
        // 목표값을 살짝 넘쳤다 되돌아오는 탄성 곡선 — 눌리는 촉감을 만든다
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // 카드 등장 — fadeIn보다 이동거리를 키우고 스프링 곡선과 조합
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // 바텀시트 모달 진입
        sheetUp: {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        // 하트 뱃지 — 한 번 부풀었다 제자리로
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "60%": { opacity: "1", transform: "scale(1.15)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // 연락처 공개 하트 파티클 — 위로 튀어올라 흩어지며 사라진다
        heartBurst: {
          "0%": { opacity: "0", transform: "translate(0, 0) scale(0.4) rotate(0deg)" },
          "15%": { opacity: "1" },
          "100%": {
            opacity: "0",
            transform: "translate(var(--dx), var(--dy)) scale(var(--s)) rotate(var(--r))",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        riseIn: "riseIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        sheetUp: "sheetUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        popIn: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        heartBurst: "heartBurst 1.1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
