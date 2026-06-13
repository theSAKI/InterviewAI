/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetailedScores } from "../types";

interface Props {
  scores: DetailedScores;
  size?: number;
}

export default function MetricRadarChart({ scores, size = 300 }: Props) {
  const metrics = [
    { label: "Technical Accuracy", key: "technicalAccuracy" as keyof DetailedScores },
    { label: "Communication", key: "communication" as keyof DetailedScores },
    { label: "Problem Solving", key: "problemSolving" as keyof DetailedScores },
    { label: "Confidence", key: "confidence" as keyof DetailedScores },
    { label: "Clarity", key: "clarity" as keyof DetailedScores },
  ];

  const center = size / 2;
  const radius = (size / 2) * 0.75;

  const getCoordinatesForMetric = (index: number, value: number) => {
    // 5 points -> each is 72 degrees apart (2 * Math.PI / 5)
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate grid circles
  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map((level) => {
    const points = metrics.map((_, i) => {
      const { x, y } = getCoordinatesForMetric(i, level);
      return `${x},${y}`;
    });
    return points.join(" ");
  });

  // Calculate coordinates for the actual scores
  const scorePoints = metrics.map((m, i) => {
    const value = scores[m.key] || 50;
    const { x, y } = getCoordinatesForMetric(i, value);
    return `${x},${y}`;
  }).join(" ");

  // Coordinates for metric label texts
  const labelPositions = metrics.map((m, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelRadius = radius + 22;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y, label: m.label, align: Math.cos(angle) > 0.1 ? "start" : Math.cos(angle) < -0.1 ? "end" : "middle" };
  });

  return (
    <div id="metric-radar-container" className="flex flex-col items-center justify-center p-4 bg-card-dark/40 border border-border-dark rounded-2xl backdrop-blur-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background polar grids */}
        {gridPaths.map((path, idx) => (
          <polygon
            key={idx}
            points={path}
            fill="none"
            stroke="rgba(161, 161, 170, 0.15)"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? "2,2" : "0"}
          />
        ))}

        {/* Outer label connectors */}
        {metrics.map((_, i) => {
          const outer = getCoordinatesForMetric(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(161, 161, 170, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Polygon of scores */}
        <polygon
          points={scorePoints}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#10b981"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Data points */}
        {metrics.map((m, i) => {
          const value = scores[m.key] || 50;
          const { x, y } = getCoordinatesForMetric(i, value);
          return (
            <g key={i} className="group">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#10b981"
                stroke="#09090b"
                strokeWidth="1.5"
                className="transition-all duration-700 ease-out cursor-pointer hover:scale-150"
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                className="opacity-0 group-hover:opacity-100 bg-black/90 px-1 py-0.5 rounded font-mono transition-opacity duration-200 pointer-events-none"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Circular Grid Text Legends */}
        {gridLevels.map((level, idx) => {
          const { x, y } = getCoordinatesForMetric(0, level);
          return (
            <text
              key={idx}
              x={x + 4}
              y={y + 11}
              fill="rgba(161, 161, 170, 0.4)"
              fontSize="8"
              fontFamily="monospace"
            >
              {level}
            </text>
          );
        })}

        {/* Axis Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y + 3}
            textAnchor={pos.align}
            fill="#a1a1aa"
            fontSize="10"
            fontWeight="500"
            className="font-sans antialiased text-[9px] sm:text-[11px]"
          >
            {pos.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
