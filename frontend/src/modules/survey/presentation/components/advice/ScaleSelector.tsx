// src/modules/survey/presentation/components/advice/ScaleSelector.tsx
import { cn } from "@ds/lib/cn";

interface ScaleSelectorProps {
  options: string[];
  selected: number[];
  onChange: (selected: number[]) => void;
  maxSelection?: number;
}

export function ScaleSelector({
  options,
  selected,
  onChange,
  maxSelection = 3,
}: ScaleSelectorProps) {
  const handleToggle = (index: number) => {
    if (selected.includes(index)) {
      onChange(selected.filter((i) => i !== index));
    } else if (selected.length < maxSelection) {
      onChange([...selected, index]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selected.includes(index);
        const isDisabled = !isSelected && selected.length >= maxSelection;

        return (
          <button
            key={index}
            onClick={() => handleToggle(index)}
            disabled={isDisabled}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-3 text-right text-sm transition-all",
              isSelected
                ? "border-cyan-400 bg-cyan-50 font-semibold text-cyan-900"
                : isDisabled
                  ? "border-border bg-gray-50 text-ink-subtle opacity-50"
                  : "border-border bg-white text-ink hover:border-cyan-300 hover:bg-cyan-50/50",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  isSelected
                    ? "border-cyan-500 bg-cyan-500"
                    : "border-gray-300 bg-white",
                )}
              >
                {isSelected && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="flex-1 leading-relaxed">{option}</span>
            </div>
          </button>
        );
      })}

      {maxSelection && (
        <p className="text-xs text-ink-subtle">
          حداکثر {maxSelection} مورد انتخاب کنید (انتخاب‌شده: {selected.length})
        </p>
      )}
    </div>
  );
}
