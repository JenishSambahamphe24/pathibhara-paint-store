import clsx from "clsx";

interface SeparatorHeaderProps {
  title: string;
  position?: "left" | "center" | "right";
  className?: string;
  lineClassName?: string;
  containerClassName?: string;
}

/**
 *
 */
export function SeparatorHeader(props: SeparatorHeaderProps) {
  const position = props.position || "center";

  return (
    <div className={clsx("flex items-center gap-3", props.containerClassName)}>
      {position !== "left" && (
        <div
          className={clsx(
            "grow border-b border-border-strong",
            props.lineClassName,
          )}
        />
      )}

      <p className={clsx("text-xl font-semibold", props.className)}>
        {props.title}
      </p>

      {position !== "right" && (
        <div
          className={clsx(
            "grow border-b border-border-strong",
            props.lineClassName,
          )}
        />
      )}
    </div>
  );
}
