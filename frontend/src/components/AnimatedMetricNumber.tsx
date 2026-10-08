'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedMetricNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedMetricNumber: React.FC<AnimatedMetricNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    setIsAnimating(true);
    const duration = 550; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutCubic curve: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = startValue + (endValue - startValue) * ease;

      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value]);

  const formattedNumber =
    decimals > 0
      ? displayValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })
      : Math.round(displayValue).toLocaleString();

  return (
    <span
      key={value}
      className={`inline-block transition-all duration-300 ${
        isAnimating ? 'animate-float-in' : ''
      } ${className}`}
    >
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};
