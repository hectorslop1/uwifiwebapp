export function ContentCanvas({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 overflow-visible px-4 pt-3 pb-[clamp(40px,6vh,92px)] sm:px-5 sm:pt-3 lg:flex-1 lg:min-h-0 lg:gap-3 lg:px-6 lg:pt-3 lg:pr-5 lg:pb-[clamp(48px,6vh,96px)] xl:max-w-[1320px] xl:px-7 xl:pt-4 xl:pr-6 xl:pb-[clamp(56px,6vh,110px)]">
      {children}
    </div>
  );
}
