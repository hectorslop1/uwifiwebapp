import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "U-wifi",
  description: "U-wifi Customer Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const storedTheme = window.localStorage.getItem("uwifi-theme");
              const theme =
                storedTheme === "dark"
                  ? "dark"
                  : storedTheme === "system"
                    ? window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "dark"
                      : "light"
                    : "light";
              document.documentElement.dataset.theme = theme;
            } catch (error) {
              document.documentElement.dataset.theme = "light";
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
