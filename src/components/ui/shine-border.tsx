import type { CSSProperties } from "react";

import styles from "./shine-border.module.css";

type ShineBorderProps = {
  className?: string;
  borderWidth?: number;
  duration?: number;
  shineColor?: string | [string, string, string];
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ShineBorder({
  className,
  borderWidth = 1.5,
  duration = 5.8,
  shineColor = ["#ffffff", "#9f86ff", "#89d8ff"],
}: Readonly<ShineBorderProps>) {
  const palette = Array.isArray(shineColor) ? shineColor : [shineColor, shineColor, shineColor];
  const [colorOne, colorTwo = colorOne, colorThree = colorTwo] = palette;

  const style = {
    "--shine-border-width": `${borderWidth}px`,
    "--shine-border-duration": `${duration}s`,
    "--shine-color-1": colorOne,
    "--shine-color-2": colorTwo,
    "--shine-color-3": colorThree,
  } as CSSProperties;

  return <div aria-hidden className={cx(styles.root, className)} style={style} />;
}
