"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/auth/AuthModal";
import WelcomeModal from "@/components/auth/WelcomeModal";

export function Providers({ children, ...props }: any) {
  return (
    <SessionProvider>
      <ThemeProvider {...props}>
        <AuthModalProvider>
          {children}
          <AuthModal />
          <WelcomeModal />
        </AuthModalProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
