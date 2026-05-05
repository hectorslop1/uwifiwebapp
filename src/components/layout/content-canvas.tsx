export function ContentCanvas({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.4rem)] w-full max-w-[1280px] flex-col gap-3 overflow-hidden px-4 py-3 sm:px-5 sm:py-3 lg:h-[calc(100dvh-5.4rem)] lg:min-h-0 lg:gap-3 lg:px-6 lg:py-3 xl:max-w-[1320px] xl:px-7 xl:py-4">
      {children}
    </div>
  );
}
