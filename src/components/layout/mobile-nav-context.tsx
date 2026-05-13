"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type MobileNavContextValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function useMobileNav() {
  const value = useContext(MobileNavContext);

  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider.");
  }

  return value;
}

export function MobileNavProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileNavOpen, setMobileNavOpenState] = useState(false);

  const setMobileNavOpen = useCallback((open: boolean) => {
    setMobileNavOpenState(open);
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpenState(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpenState(false), []);
  const toggleMobileNav = useCallback(
    () => setMobileNavOpenState((current) => !current),
    [],
  );

  const value = useMemo(
    () => ({
      mobileNavOpen,
      setMobileNavOpen,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
    }),
    [closeMobileNav, mobileNavOpen, openMobileNav, setMobileNavOpen, toggleMobileNav],
  );

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

