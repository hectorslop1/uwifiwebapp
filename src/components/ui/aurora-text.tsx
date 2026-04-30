import type { ReactNode } from "react";

import styles from "./aurora-text.module.css";

type AuroraTextProps = {
  children: ReactNode;
  className?: string;
};

function cx(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AuroraText({
  children,
  className,
}: Readonly<AuroraTextProps>) {
  return <span className={cx(styles.aurora, className)}>{children}</span>;
}
