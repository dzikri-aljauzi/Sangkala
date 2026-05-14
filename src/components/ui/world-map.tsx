"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Dot {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
}

interface WorldMapProps {
  dots?: Dot[];
  lineColor?: string;
  dotColor?: string;
}

function latLngToXY(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
}

function generateCurvePath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): string {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - Math.abs(start.x - end.x) * 0.2;

  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

export default function WorldMap({
  dots = [],
  lineColor = "#0891b2",
  dotColor = "#fbbf24",
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { width, height } = dimensions;

  return (
    <div ref={containerRef} className="relative w-full aspect-[2/1]">
      {/* World Map SVG Background */}
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full"
        style={{ background: "transparent" }}
      >
        {/* Simplified world map dots pattern */}
        <g fill="#e2e8f0" opacity="0.3">
          {/* Generate a dot pattern representing continents */}
          {Array.from({ length: 50 }).map((_, row) =>
            Array.from({ length: 100 }).map((_, col) => {
              const x = col * 8 + 4;
              const y = row * 8 + 4;
              // Simple continent approximation
              const isLand =
                // North America
                (x > 50 && x < 200 && y > 80 && y < 200) ||
                // South America
                (x > 120 && x < 200 && y > 200 && y < 350) ||
                // Europe
                (x > 350 && x < 450 && y > 80 && y < 180) ||
                // Africa
                (x > 350 && x < 480 && y > 150 && y < 320) ||
                // Asia
                (x > 450 && x < 700 && y > 60 && y < 250) ||
                // Australia
                (x > 600 && x < 720 && y > 270 && y < 350) ||
                // Indonesia
                (x > 550 && x < 650 && y > 220 && y < 280);

              if (!isLand) return null;

              return (
                <circle
                  key={`${row}-${col}`}
                  cx={x}
                  cy={y}
                  r="1.5"
                />
              );
            })
          )}
        </g>

        {/* Connection lines */}
        {dots.map((dot, index) => {
          const start = latLngToXY(dot.start.lat, dot.start.lng, 800, 400);
          const end = latLngToXY(dot.end.lat, dot.end.lng, 800, 400);
          const path = generateCurvePath(start, end);

          return (
            <g key={index}>
              <motion.path
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  duration: 2,
                  delay: index * 0.3,
                  ease: "easeInOut",
                }}
              />
              {/* Start point */}
              <motion.circle
                cx={start.x}
                cy={start.y}
                r="4"
                fill={dotColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
              />
              {/* End point */}
              <motion.circle
                cx={end.x}
                cy={end.y}
                r="4"
                fill={dotColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.3 + 1.5 }}
              />
              {/* Animated dot along path */}
              <motion.circle
                r="3"
                fill="#fff"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2,
                  delay: index * 0.3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                style={{
                  offsetPath: `path('${path}')`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
