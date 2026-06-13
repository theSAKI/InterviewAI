/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedSession } from "../types";

interface Props {
  history: SavedSession[];
  width?: number;
  height?: number;
}

export default function WeeklyTrendChart({ history, width = 500, height = 180 }: Props) {
  // Only use actual candidate sessions
  const chartData: { label: string; score: number; date: string }[] = [];

  // Append user scores
  if (history && history.length > 0) {
    // Reverse so the progress flows from oldest to newest (left to right)
    const cronHistory = [...history].reverse();
    cronHistory.forEach((sess, idx) => {
      chartData.push({
        label: `Sess ${idx + 1}`,
        score: sess.score,
        date: sess.date.substring(5, 10), // Short MM-DD
      });
    });
  }

  // Keep last 7 data points for neat visualization
  const pointsToDraw = chartData.slice(-7);

  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minScore = 50;
  const maxScore = 100;

  const getCoordinates = (index: number, score: number) => {
    const x = paddingLeft + (index / (pointsToDraw.length - 1 || 1)) * chartWidth;
    // Invert Y coordinate so 100 score is at the top
    const normalizedScore = (score - minScore) / (maxScore - minScore);
    const y = paddingTop + (1 - normalizedScore) * chartHeight;
    return { x, y };
  };

  // Generate SVG path points
  const drawPoints = pointsToDraw.map((d, i) => getCoordinates(i, d.score));
  
  // Build standard path string
  let pathString = "";
  if (drawPoints.length > 0) {
    pathString = `M ${drawPoints[0].x} ${drawPoints[0].y}`;
    for (let i = 1; i < drawPoints.length; i++) {
      // Use standard bezier or linear line joining
      pathString += ` L ${drawPoints[i].x} ${drawPoints[i].y}`;
    }
  }

  // Build filled area path (closed at the bottom)
  let areaString = "";
  if (drawPoints.length > 0) {
    areaString = `${pathString} L ${drawPoints[drawPoints.length - 1].x} ${height - paddingBottom} L ${drawPoints[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div id="weekly-trend-container" className="flex flex-col w-full h-full p-4 bg-card-dark/40 border border-border-dark rounded-2xl backdrop-blur-sm justify-between min-h-[180px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Score Progress Arc</h4>
        <span className="text-xs text-accent-emerald bg-accent-emerald/10 px-2.5 py-0.5 rounded-full border border-accent-emerald/20 font-mono">
          {pointsToDraw.length === 0 ? "No active sessions" : `Last ${pointsToDraw.length} Attempts`}
        </span>
      </div>

      {pointsToDraw.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-8 text-center select-none">
          <p className="text-xs text-text-muted font-sans max-w-[280px] leading-relaxed">
            No session history recorded yet. Complete an interview in the practice room to see your score progress trend!
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden flex justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" style={{ maxHeight: height }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[50, 60, 70, 80, 90, 100].map((scoreLevel) => {
              const yCoord = getCoordinates(0, scoreLevel).y;
              return (
                <line
                  key={scoreLevel}
                  x1={paddingLeft}
                  y1={yCoord}
                  x2={width - paddingRight}
                  y2={yCoord}
                  stroke="rgba(161, 161, 170, 0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Left Y-axis labels */}
            {[50, 75, 100].map((scoreLevel) => {
              const yCoord = getCoordinates(0, scoreLevel).y;
              return (
                <text
                  key={scoreLevel}
                  x={paddingLeft - 8}
                  y={yCoord + 3}
                  textAnchor="end"
                  className="fill-text-muted font-mono text-[9px] antialiased"
                >
                  {scoreLevel}
                </text>
              );
            })}

            {/* Shaded Area Under Curve */}
            {areaString && (
              <path
                d={areaString}
                fill="url(#chartGradient)"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Glowing Line */}
            {pathString && (
              <path
                d={pathString}
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            )}

            {/* Data Points Coordinates and Text Markers */}
            {drawPoints.map((pt, i) => {
              const score = pointsToDraw[i].score;
              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#10b981"
                    stroke="#09090b"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 hover:fill-accent-emerald-hover transition-all duration-150"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="fill-text-premium font-mono text-[9px] font-bold"
                  >
                    {score}
                  </text>
                  {/* X Axis dates */}
                  <text
                    x={pt.x}
                    y={height - paddingBottom + 15}
                    textAnchor="middle"
                    className="fill-text-muted font-sans text-[8px] sm:text-[10px]"
                  >
                  {pointsToDraw[i].date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      )}

      <div className="flex items-center gap-4 text-[10px] text-text-muted mt-2 font-sans justify-center">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Baseline Practice
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
          AI Mock Session
        </span>
      </div>
    </div>
  );
}
