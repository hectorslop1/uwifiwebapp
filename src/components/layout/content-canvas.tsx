export function ContentCanvas({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-6.8rem)] w-full max-w-[1240px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10 xl:py-7">
      {children}
    </div>
  );
}
