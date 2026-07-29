import { toAsciiDigits } from "@core/text/digits";
import { TextInput } from "@ds/components/TextInput";

import type { TextQuestion } from "@survey/domain/entities/question.entity";

export interface TextFieldProps {
  question: TextQuestion;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  id: string;
}

export function TextField({
  question,
  value,
  onChange,
  invalid,
  describedBy,
  id,
}: TextFieldProps) {
  const isNationalId = question.format === "national-id";

  return (
    <TextInput
      id={id}
      type="text"
      dir={isNationalId ? "ltr" : "rtl"}
      inputMode={isNationalId ? "numeric" : "text"}
      autoComplete={isNationalId ? "off" : "name"}
      maxLength={isNationalId ? 10 : question.maxLength}
      placeholder={question.placeholder}
      value={value}
      invalid={invalid ?? false}
      aria-describedby={describedBy}
      className={isNationalId ? "text-left tracking-[0.25em]" : undefined}
      onChange={(event) => {
        const raw = event.target.value;
        // A national id is digits only, and Persian ones are normalised so the
        // checksum rule and the backend both see the same characters.
        onChange(isNationalId ? toAsciiDigits(raw).replace(/\D/g, "") : raw);
      }}
    />
  );
}
