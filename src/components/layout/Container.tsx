import type { ReactNode } from "react";
import clsx from "clsx";

type ContainerProps = {
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
};

export function Container({
  as: Tag = "div",
  children,
  className,
  bleed = false,
}: ContainerProps) {
  return (
    <Tag
      className={clsx(
        bleed ? "w-full px-6 sm:px-10 lg:px-12" : "mx-auto w-full max-w-[1180px] px-6 sm:px-10 lg:px-12",
        className,
      )}
    >
      {children}
    </Tag>
  );
}





