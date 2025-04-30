import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type ColorAccent = keyof typeof import("./theme").theme.colors;

interface ThemeContextProps {
  theme: ThemeMode;
  colorAccent: ColorAccent;
  setTheme: (theme: ThemeMode) => void;
  setColorAccent: (color: ColorAccent) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [colorAccent, setColorAccent] = useState<ColorAccent>("primary");

  // Apply theme settings to <html> or <body>
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // You can later add system theme detection too.

    root.style.setProperty("--accent-color", `var(--color-${colorAccent}-500)`);
  }, [theme, colorAccent]);

  return (
    <ThemeContext.Provider
      value={{ theme, colorAccent, setTheme, setColorAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use Theme Context easily
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
