import { useState } from "react";

const DAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export function DailyNoteField() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-ink">شکرگزاری روزانه:</p>
      <p className="text-xs text-ink/60">پایان هر روز، یک اتفاق خوب بنویسید.</p>
      <div className="space-y-3">
        {DAYS.map((day) => (
          <div key={day} className="space-y-1">
            <label className="text-xs font-medium text-ink/70">{day}</label>
            <textarea
              rows={2}
              value={notes[day] ?? ""}
              onChange={(e) => setNotes((p) => ({ ...p, [day]: e.target.value }))}
              placeholder="یادداشت..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
