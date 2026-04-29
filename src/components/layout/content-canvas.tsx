export function ContentCanvas({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.4rem)] w-full max-w-[1220px] flex-col gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:h-[calc(100dvh-5.4rem)] lg:min-h-0 lg:gap-4 lg:px-7 lg:py-4 xl:px-8 xl:py-5">
      {children}
    </div>
  );
}
