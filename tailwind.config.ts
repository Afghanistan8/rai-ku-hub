import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        ink: {
          DEFAULT: "#0a0908", // page background, near-black warm
          panel: "#121010", // section background
        },
        card: {
          DEFAULT: "#171310",
          hover: "#1c1714",
          border: "rgba(255,255,255,0.07)",
          borderHover: "rgba(224,138,79,0.35)",
        },
        // Copper/rust accent — the one signature color
        signal: {
          DEFAULT: "#cc7a45",
          bright: "#e0955f",
          dim: "#8a5433",
        },
        ash: {
          50: "#f4f1ed",
          200: "#d8d2ca",
          400: "#a89e93",
          500: "#8a8078",
          600: "#6b6259",
          700: "#4d453f",
          800: "#2a2522",
        },
        // Sampled from the mascot's iris (mean #5EAA36, highlight #96D64F)
        eye: {
          dim: "#3f7d27",
          DEFAULT: "#63c93c",
          bright: "#96d64f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-texture":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "card-gradient": "linear-gradient(160deg, #1a1512 0%, #121010 100%)",
      },
      backgroundSize: {
        grid: "34px 34px",
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-18px) rotate(1deg)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fillGrow: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(350%)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
        riseIn: "riseIn 0.4s ease-out both",
        floatY: "floatY 6s ease-in-out infinite",
        spinSlow: "spinSlow 240s linear infinite",
        fillGrow: "fillGrow 1.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
