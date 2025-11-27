"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Importujemy typy bezpośrednio z paczki, żeby TypeScript nie krzyczał
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}