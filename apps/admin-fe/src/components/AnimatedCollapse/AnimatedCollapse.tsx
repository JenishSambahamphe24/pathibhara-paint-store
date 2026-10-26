import { useEffect, useRef, useState } from "react";

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function AnimatedCollapse(props: AnimatedCollapseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    if (props.isOpen) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [props.isOpen, props.children]);

  return (
    <div
      style={{ height }}
      className="overflow-hidden transition-[height] duration-300 ease-in-out"
    >
      <div ref={ref}>{props.children}</div>
    </div>
  );
}
