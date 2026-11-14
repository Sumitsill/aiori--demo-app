import React, { useState } from 'react';

interface StepData {
  date: string;
  day: string;
  steps: number;
}

interface CalorieData {
  date: string;
  day: string;
  calories: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export const StepCountChart: React.FC<{ data: StepData[]; target?: number }> = ({
  data,
  target = 10000,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxSteps = Math.max(...data.map((d) => d.steps), target * 1.15);
  const chartHeight = 180;
  const chartWidth = 480;
  const barWidth = 32;
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-slate-400 font-mono">Last 7 Days Activity</span>
        <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
          <span className="w-2 h-0.5 bg-emerald-400" />
          Target: {target.toLocaleString()} steps/day
        </span>
      </div>

      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="stepBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="stepBarHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {/* Target Line */}
          {target && (
            <line
              x1="0"
              y1={chartHeight - (target / maxSteps) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (target / maxSteps) * chartHeight}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
          )}

          {/* Bars */}
          {data.map((d, i) => {
            const h = (d.steps / maxSteps) * chartHeight;
            const x = gap + i * (barWidth + gap);
            const y = chartHeight - h;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.date}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Background column highlight on hover */}
                {isHovered && (
                  <rect
                    x={x - 4}
                    y="0"
                    width={barWidth + 8}
                    height={chartHeight}
                    fill="rgba(255,255,255,0.03)"
                    rx="8"
                  />
                )}

                {/* Main bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx="6"
                  fill={isHovered ? 'url(#stepBarHover)' : 'url(#stepBarGrad)'}
                  className="transition-all duration-200"
                />

                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${isHovered ? 'fill-emerald-300 font-bold' : 'fill-slate-400'}`}
                >
                  {d.day}
                </text>

                {/* Step tooltip value */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 14}
                      y={Math.max(4, y - 24)}
                      width="60"
                      height="20"
                      rx="6"
                      fill="#121724"
                      stroke="rgba(16,185,129,0.4)"
                    />
                    <text
                      x={x + 16}
                      y={Math.max(18, y - 10)}
                      textAnchor="middle"
                      className="fill-emerald-300 text-[10px] font-mono font-bold"
                    >
                      {d.steps.toLocaleString()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const CalorieTrendChart: React.FC<{ data: CalorieData[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxCal = Math.max(...data.map((d) => d.calories), 700);
  const chartHeight = 160;
  const chartWidth = 480;
  const paddingX = 30;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (chartWidth - paddingX * 2)) / (data.length - 1);
    const y = chartHeight - (d.calories / maxCal) * (chartHeight - 30) - 15;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-slate-400 font-mono">Caloric Expenditure (Active Burn)</span>
        <span className="text-amber-400 font-mono text-[11px]">MET-Calibrated Energy Burn</span>
      </div>

      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-44 select-none">
          <defs>
            <linearGradient id="calAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#calAreaGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points & Day labels */}
          {points.map((p) => (
            <g key={p.date} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#121724"
                stroke="#f59e0b"
                strokeWidth="2.5"
                className="transition-transform group-hover:scale-125"
              />
              <text
                x={p.x}
                y={chartHeight + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[11px] font-mono"
              >
                {p.day}
              </text>
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="fill-amber-300 text-[10px] font-mono font-semibold"
              >
                {Math.round(p.calories)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export const CategoryBreakdown: React.FC<{ data: CategoryData[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-3">
      {data.map((cat, i) => {
        const pct = Math.round((cat.value / total) * 100);
        const color = colors[i % colors.length];
        return (
          <div key={cat.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{cat.name}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {cat.value} sessions ({pct}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

