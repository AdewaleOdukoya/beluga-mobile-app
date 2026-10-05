import { Platform } from "react-native";

// Mirrors the web store's Tailwind theme (globals.css) so both apps share one look.
export const colors = {
  brand50: "#eef7f6",
  brand100: "#d3ebe9",
  brand200: "#a6d4d1",
  brand500: "#13807f",
  brand600: "#0e6e70",
  brand700: "#0a5c5f",
  brand800: "#084a4c",
  brand900: "#063a3c",

  lime50: "#f3faec",
  lime100: "#e3f3d2",
  lime300: "#b9e28f",
  lime400: "#97d664",
  lime500: "#7dbb45",
  lime600: "#66a033",

  berry500: "#a0368f",
  sale: "#d6312b",
  amber: "#f5a623",

  ink: "#1d2b2b",
  muted: "#5f6f6f",
  line: "#e5ebe8",
  canvas: "#f6f8f7",
  white: "#ffffff",
};

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  mono: Platform.select({ ios: "Courier", default: "monospace" }),
};

export const radius = { sm: 8, md: 10, lg: 14, xl: 18, xxl: 24, full: 999 };

export const shadow = {
  card: {
    shadowColor: "#0a5c5f",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
