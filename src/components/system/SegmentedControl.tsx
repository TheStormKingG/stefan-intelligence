"use client";

interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="segmented-control">
      {segments.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className={`segment ${seg.value === value ? "segment-active" : ""}`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
