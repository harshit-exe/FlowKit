"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAuthModal = () => setIsOpen(true);
  const closeAuthModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
