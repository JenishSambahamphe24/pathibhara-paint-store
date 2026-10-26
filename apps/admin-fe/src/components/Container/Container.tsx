import type { PropsWithChildren } from "react";

export function Container(props: PropsWithChildren) {
  return <div className="mx-auto h-full max-w-9xl">{props.children}</div>;
}
