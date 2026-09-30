import { useState, useEffect, useRef } from "react";
import { Tooltip } from "@mui/material";

interface TruncatedTooltipProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  placement?: "top" | "bottom" | "left" | "right";
  href?: string;
}

const TruncatedTooltip = ({
  children,
  title,
  className = "",
  as: Component = "p",
  placement = "top",
  ...rest
}: TruncatedTooltipProps) => {
  const textRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth ||
            textRef.current.scrollHeight > textRef.current.clientHeight,
        );
      }
    };
    checkTruncation();
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [children]);

  const isClamped = className.includes("line-clamp");
  const overflowClass = isClamped ? "" : "truncate";

  return (
    <Tooltip
      title={isTruncated ? (title ?? children) : ""}
      arrow
      placement={placement}
    >
      <Component ref={textRef} className={`${overflowClass} ${className}`} {...rest}>
        {children}
      </Component>
    </Tooltip>
  );
};

export default TruncatedTooltip;
export { TruncatedTooltip };
