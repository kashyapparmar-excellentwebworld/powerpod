import { useCountUp } from "react-countup";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber = ({
  value,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) => {
  const countUpRef = useRef<any>(null);

  const { update } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: value,
    duration,
    decimals,
    prefix,
    suffix,
    separator: ",",
  });

  useEffect(() => {
    update(value);
  }, [value, update]);

  return <span ref={countUpRef} className={className} />;
};

export default AnimatedNumber;
