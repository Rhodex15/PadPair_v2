import { createContext, useContext, useEffect, useState } from "react";
import { loadState, saveState } from "../utils/storage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => loadState("theme", "dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveState("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
