"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  board: boolean;
  toggleTheme: () => void;
  toggleBoard: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  board: false,
  toggleTheme: () => {},
  toggleBoard: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [board, setBoard] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("fir-theme");
    const savedBoard = window.localStorage.getItem("fir-board");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }
    if (savedBoard === "1") {
      setBoard(true);
      document.documentElement.dataset.board = "true";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("fir-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.board = board ? "true" : "false";
    window.localStorage.setItem("fir-board", board ? "1" : "0");
  }, [board]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        board,
        toggleTheme: () =>
          setTheme((current) => (current === "light" ? "dark" : "light")),
        toggleBoard: () => setBoard((current) => !current),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
