
interface NoteFieldProps {
  label: string;
 
  lineCount?: number;
}

export function NoteField({ label, lineCount = 3 }: NoteFieldProps) {
  return (
    <div className="my-4 bg-white rounded-2xl p-6 border-2 border-day-primary relative">
      <label className="absolute -top-2 right-3 bg-white px-1 text-sm font-semibold text-gray-500">
        {label}
      </label>
      <div className="space-y-8 pt-1">
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
    <div className={`grid gap-8`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
      {labels.map((label) => (
        <NoteField key={label} label={label} lineCount={lineCount} />
      ))}
    </div>
  );
}
