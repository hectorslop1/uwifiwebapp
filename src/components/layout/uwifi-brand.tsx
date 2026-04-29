import Image from "next/image";

type UwifiBrandTileProps = {
  className?: string;
  imageClassName?: string;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function UwifiBrandTile({
  className,
  imageClassName,
}: UwifiBrandTileProps) {
  return (
    <div
      className={cx(
        "theme-panel-subtle inline-flex items-center justify-center rounded-[1.65rem] border border-white/80",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,248,250,0.88))]",
        "shadow-[0_18px_48px_rgba(192,195,205,0.14),inset_0_1px_0_rgba(255,255,255,0.92)]",
        "backdrop-blur-xl",
        className
      )}
    >
      <Image
        src="/images/uwifi.png"
        alt="U-Wifi logo"
        width={184}
        height={140}
        priority
        className={cx(
          "h-auto w-[5.4rem] object-contain sm:w-[6rem]",
          imageClassName
        )}
      />
    </div>
  );
}
