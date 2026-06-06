import React, { useEffect, useState } from "react";

interface Star {
  id: number;
  left: string;
  top: string;
  width: string;
  height: string;
  backgroundColor: string;
  animation: string;
  boxShadow: string;
}

interface StarFieldProps {
  count?: number;
  opacity?: number;
  keyPrefix?: string;
}

export function StarField({ count = 45, opacity = 0.4, keyPrefix = "star" }: StarFieldProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate star attributes only once on mount to avoid hydration mismatch and render jitter
    const generatedStars = Array.from({ length: count }).map((_, i) => {
      const isIndigo = i % 4 === 0;
      const isCyan = i % 5 === 0;
      const backgroundColor = isIndigo ? "#7c3aed" : isCyan ? "#0ea5e9" : "#ffffff";
      
      const hasTwinkle = i % 3 === 0;
      const animation = hasTwinkle
        ? `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * 5}s`
        : "none";
        
      const hasIndigoShadow = i % 8 === 0;
      const hasCyanShadow = i % 12 === 0;
      const boxShadow = hasIndigoShadow
        ? "0 0 10px 1px rgba(124,58,237,0.3)"
        : hasCyanShadow
        ? "0 0 12px 2px rgba(14,165,233,0.3)"
        : "none";

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 2.5 + 0.5}px`,
        height: `${Math.random() * 2.5 + 0.5}px`,
        backgroundColor,
        animation,
        boxShadow,
      };
    });
    setStars(generatedStars);
  }, [count]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 hidden dark:block pointer-events-none">
      {stars.map((star) => (
        <div
          key={`${keyPrefix}-${star.id}`}
          className="absolute rounded-full transition-all duration-1000"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            backgroundColor: star.backgroundColor,
            opacity,
            animation: star.animation,
            boxShadow: star.boxShadow,
          }}
        />
      ))}
    </div>
  );
}
