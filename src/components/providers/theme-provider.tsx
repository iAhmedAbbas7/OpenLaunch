// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { ThemeProvider as NextThemesProvider } from "next-themes";

// <== THEME PROVIDER PROPS ==>
interface ThemeProviderProps {
  // <== CHILDREN ==>
  children: React.ReactNode;
}

// <== THEME PROVIDER COMPONENT ==>
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // RETURNING THEME PROVIDER COMPONENT
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};
