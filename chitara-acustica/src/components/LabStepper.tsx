type LabStepperProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  label: string;
  disabled?: boolean;
  onValueChange: (value: number) => void;
};

export function LabStepper({
  min,
  max,
  step,
  value,
  label,
  disabled = false,
  onValueChange,
}: LabStepperProps) {
  const precision = Math.max(0, (String(step).split('.')[1] ?? '').length);
  const change = (direction: -1 | 1) => {
    const next = Number((value + direction * step).toFixed(precision));
    onValueChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div className="inline-flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => change(-1)}
        disabled={disabled || value <= min}
        aria-label={`${label}: scade`}
        className="min-h-11 min-w-11 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] text-lg font-semibold text-[#0d4a3e] hover:bg-[#edf3f0] disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer touch-manipulation"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => change(1)}
        disabled={disabled || value >= max}
        aria-label={`${label}: crește`}
        className="min-h-11 min-w-11 rounded-lg border border-[#d8e2dc] bg-[#fafcfa] text-lg font-semibold text-[#0d4a3e] hover:bg-[#edf3f0] disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer touch-manipulation"
      >
        +
      </button>
    </div>
  );
}
