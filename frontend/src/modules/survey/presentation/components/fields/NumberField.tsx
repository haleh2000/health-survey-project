import { toAsciiDigits } from "@core/text/digits";
import { TextInput } from "@ds/components/TextInput";

import type { NumberQuestion } from "@survey/domain/entities/question.entity";

export interface NumberFieldProps {
  question: NumberQuestion;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  id: string;
}

/**
 * A numeric answer.
 *
 * Persian digits are folded to ASCII as the user types, so the stored answer
 * is always parseable and the request mapper never has to guess. Everything
 * else non-numeric is dropped rather than rejected, which keeps the input
 * controlled without fighting the caret.
 */
export function NumberField({
  question,
  value,
  onChange,
  invalid,
  describedBy,
  id,
}: NumberFieldProps) {
  return (
    <TextInput
      id={id}
      inputMode="decimal"
      autoComplete="off"
      value={value}
      invalid={invalid ?? false}
      aria-describedby={describedBy}
      suffix={question.unit}
      placeholder="۰"
      onChange={(event) => {
        const normalised = toAsciiDigits(event.target.value).replace(/[^\d.]/g, "");
        onChange(normalised);
      }}
    />
  );
}
