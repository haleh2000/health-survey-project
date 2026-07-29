import { ChoiceCard } from "@ds/components/ChoiceCard";
import { cn } from "@ds/lib/cn";

import { QuestionKind, type ChoiceQuestion } from "@survey/domain/entities/question.entity";

export interface ChoiceFieldProps {
  question: ChoiceQuestion;
  selected: readonly string[];
  onSelect: (value: string) => void;
  invalid?: boolean;
  /** Id of the question title — a group has no single control to label. */
  labelledBy?: string;
  describedBy?: string;
}

/** Short option lists sit side by side; longer ones stack for readability. */
const isCompact = (question: ChoiceQuestion): boolean =>
  question.options.length <= 3 &&
  question.options.every((option) => option.value.length <= 14);

export function ChoiceField({
  question,
  selected,
  onSelect,
  invalid,
  labelledBy,
  describedBy,
}: ChoiceFieldProps) {
  const multiple = question.kind === QuestionKind.MultiChoice;

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn(
        "grid gap-2.5",
        isCompact(question) ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1",
      )}
    >
      {question.options.map((option) => (
        <ChoiceCard
          key={option.value}
          type={multiple ? "checkbox" : "radio"}
          name={question.id}
          value={option.value}
          label={option.value}
          checked={selected.includes(option.value)}
          onSelect={onSelect}
          invalid={invalid ?? false}
        />
      ))}
    </div>
  );
}
