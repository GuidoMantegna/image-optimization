"use client";

import { memo, useCallback } from "react";
import {
  PhotoFilters,
  PhotoColor,
  PhotoOrientation,
  PhotoOrderBy,
} from "@/types/unsplash";

// ─── Color swatches ────────────────────────────────────────────────────────

const COLORS: { value: PhotoColor; label: string; style: React.CSSProperties }[] = [
  {
    value: "black_and_white",
    label: "Black & White",
    style: { background: "linear-gradient(135deg, #111 50%, #e5e5e5 50%)" },
  },
  { value: "black",   label: "Black",   style: { background: "#111111" } },
  { value: "white",   label: "White",   style: { background: "#f0f0f0" } },
  { value: "yellow",  label: "Yellow",  style: { background: "#facc15" } },
  { value: "orange",  label: "Orange",  style: { background: "#fb923c" } },
  { value: "red",     label: "Red",     style: { background: "#ef4444" } },
  { value: "purple",  label: "Purple",  style: { background: "#a855f7" } },
  { value: "magenta", label: "Magenta", style: { background: "#ec4899" } },
  { value: "green",   label: "Green",   style: { background: "#22c55e" } },
  { value: "teal",    label: "Teal",    style: { background: "#14b8a6" } },
  { value: "blue",    label: "Blue",    style: { background: "#3b82f6" } },
];

// ─── Orientation icons ─────────────────────────────────────────────────────

function LandscapeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" fill="none" aria-hidden className={className}>
      <rect x="0.6" y="0.6" width="16.8" height="10.8" rx="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function PortraitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 18" fill="none" aria-hidden className={className}>
      <rect x="0.6" y="0.6" width="10.8" height="16.8" rx="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <rect x="0.6" y="0.6" width="12.8" height="12.8" rx="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const ORIENTATIONS: {
  value: PhotoOrientation;
  label: string;
  Icon: (p: { className?: string }) => React.ReactElement;
}[] = [
  { value: "landscape", label: "Landscape", Icon: LandscapeIcon },
  { value: "portrait",  label: "Portrait",  Icon: PortraitIcon  },
  { value: "squarish",  label: "Square",    Icon: SquareIcon    },
];

// ─── Shared pill styles ────────────────────────────────────────────────────

const pillBase =
  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

const pillActive = "bg-white text-neutral-900";
const pillIdle   =
  "bg-neutral-800/70 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white";

// ─── Component ─────────────────────────────────────────────────────────────

interface FilterBarProps {
  filters: PhotoFilters;
  onChange: (filters: PhotoFilters) => void;
}

export const FilterBar = memo(function FilterBar({
  filters,
  onChange,
}: FilterBarProps) {
  const setColor = useCallback(
    (color: PhotoColor) =>
      onChange({ ...filters, color: filters.color === color ? undefined : color }),
    [filters, onChange]
  );

  const setOrientation = useCallback(
    (orientation: PhotoOrientation) =>
      onChange({
        ...filters,
        orientation: filters.orientation === orientation ? undefined : orientation,
      }),
    [filters, onChange]
  );

  const setOrderBy = useCallback(
    (order_by: PhotoOrderBy) =>
      onChange({
        ...filters,
        order_by: filters.order_by === order_by ? undefined : order_by,
      }),
    [filters, onChange]
  );

  const clearAll = useCallback(() => onChange({}), [onChange]);

  const hasActive = !!(filters.color || filters.orientation || filters.order_by);

  return (
    <div
      role="group"
      aria-label="Photo filters"
      className="flex items-center gap-x-0 overflow-x-auto scrollbar-hide py-2"
    >
      {/* ── Color ─────────────────────────────────────────── */}
      <span className="text-xs text-neutral-500 shrink-0 mr-2">Color</span>

      <div className="flex items-center gap-1.5 shrink-0">
        {COLORS.map(({ value, label, style }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={filters.color === value}
            title={label}
            onClick={() => setColor(value)}
            style={style}
            className={[
              "w-5 h-5 rounded-full shrink-0 transition-all duration-150",
              "ring-offset-neutral-950 focus-visible:outline-none",
              filters.color === value
                ? "ring-2 ring-white ring-offset-2 scale-110"
                : "ring-1 ring-neutral-700 hover:ring-neutral-400 hover:ring-offset-1 hover:scale-110",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-neutral-700 shrink-0 mx-3" aria-hidden />

      {/* ── Orientation ───────────────────────────────────── */}
      <span className="text-xs text-neutral-500 shrink-0 mr-2">Orientation</span>

      <div className="flex items-center gap-1.5 shrink-0">
        {ORIENTATIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={filters.orientation === value}
            onClick={() => setOrientation(value)}
            className={`${pillBase} ${filters.orientation === value ? pillActive : pillIdle}`}
          >
            <Icon
              className={`shrink-0 ${
                value === "landscape" ? "w-4 h-2.5" :
                value === "portrait"  ? "w-2.5 h-4" :
                "w-3 h-3"
              }`}
            />
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-neutral-700 shrink-0 mx-3" aria-hidden />

      {/* ── Sort ──────────────────────────────────────────── */}
      <span className="text-xs text-neutral-500 shrink-0 mr-2">Sort</span>

      <div className="flex items-center gap-1.5 shrink-0">
        {(["relevant", "latest"] as PhotoOrderBy[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`Sort by ${value}`}
            aria-pressed={filters.order_by === value}
            onClick={() => setOrderBy(value)}
            className={`${pillBase} ${filters.order_by === value ? pillActive : pillIdle}`}
          >
            {value === "relevant" ? "Relevant" : "Latest"}
          </button>
        ))}
      </div>

      {/* ── Clear ─────────────────────────────────────────── */}
      {hasActive && (
        <>
          <div className="w-px h-4 bg-neutral-700 shrink-0 mx-3" aria-hidden />
          <button
            type="button"
            onClick={clearAll}
            className={`${pillBase} text-neutral-400 border border-neutral-700
              hover:text-white hover:bg-neutral-800 hover:border-neutral-600`}
          >
            <svg
              className="w-2.5 h-2.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </>
      )}
    </div>
  );
});
