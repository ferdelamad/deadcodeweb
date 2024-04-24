"use client"

import React , { useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme } = useTheme();

  const setDark = useCallback(() => setTheme("dark"), [setTheme]);
  const setLight = useCallback(() => setTheme("light"), [setTheme]);

  return (
    <>
      <button>
        <Sun  onClick={setLight} className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <Moon onClick={setDark} className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 dark:hidden" />
      </button>
    </>
  )
}

export default ModeToggle;
