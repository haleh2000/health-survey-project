// NoteField.tsx
interface NoteFieldProps {
  label: string;
  lineCount?: number;
}

export function NoteField({ label, lineCount = 3 }: NoteFieldProps) {
  return (
    <div className="my-3 sm:my-4 bg-white rounded-2xl p-3 sm:p-6 border-2 border-day-primary relative">
      <label className="absolute -top-2 right-3 bg-white px-1 text-xs sm:text-sm font-semibold text-gray-500">
        {label}
      </label>
      <div className="space-y-6 sm:space-y-8 pt-1">
        {Array.from({ length: lineCount }).map((_, index) => (
          <div key={index} className="border-b border-gray-300" />
        ))}
      </div>
    </div>
  );
}

interface NoteFieldsProps {
  labels: string[];
  gridCols?: number;
  lineCount?: number;
}

export function NoteFields({ labels, gridCols = 2, lineCount = 3 }: NoteFieldsProps) {
  return (
    <div
      className="grid gap-4 sm:gap-8 grid-cols-1"
      style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      // On mobile, force single column regardless of gridCols
    >
      {labels.map((label) => (
        <NoteField key={label} label={label} lineCount={lineCount} />
      ))}
    </div>
  );
}
