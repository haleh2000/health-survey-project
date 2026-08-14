import { FieldShell } from "@ds/components/FieldShell";

import {
  QuestionKind,
  type ChoiceQuestion,
  type Question,
} from "@survey/domain/entities/question.entity";
import { questionAnchorId } from "@survey/presentation/components/question-anchor";
import { ChoiceField } from "@survey/presentation/components/fields/ChoiceField";
import { JalaliCalendarField } from "./fields/JalaliCalendarField";
import { NumberField } from "@survey/presentation/components/fields/NumberField";
import { TextField } from "@survey/presentation/components/fields/TextField";
import { persianInteger } from "@survey/presentation/format/persian";


export interface QuestionFieldProps {
  question: Question;
  /** Position within the current step, for the visible numbering. */
  position: number;
  value: string;
  selected: readonly string[];
  error?: string;
  onSetValue: (value: string) => void;
  onToggleValue: (question: ChoiceQuestion, value: string) => void;
}

export function QuestionField({
  question,
  position,
  value,
  selected,
  error,
  onSetValue,
  onToggleValue,
}: QuestionFieldProps) {
  const controlId = `q-${question.id}`;
  const errorId = error ? `${controlId}-error` : undefined;
  const labelId = `${controlId}-label`;
  const invalid = Boolean(error);

  const control = () => {
    switch (question.kind) {
      case QuestionKind.Text:
        return (
          <TextField
            id={controlId}
            question={question}
            value={value}
            onChange={onSetValue}
            invalid={invalid}
            describedBy={errorId}
          />
        );

      case QuestionKind.Number:
        return (
          <NumberField
            id={controlId}
            question={question}
            value={value}
            onChange={onSetValue}
            invalid={invalid}
            describedBy={errorId}
          />
        );

      case QuestionKind.JalaliDate:
        return (
          <JalaliCalendarField
            value={value}
            onChange={onSetValue}
          />
        );

      case QuestionKind.SingleChoice:
        return (
          <ChoiceField
            question={question}
            selected={selected}
            invalid={invalid}
            labelledBy={labelId}
            describedBy={errorId}
            onSelect={onSetValue}
          />
        );

      case QuestionKind.MultiChoice:
        return (
          <ChoiceField
            question={question}
            selected={selected}
            invalid={invalid}
            labelledBy={labelId}
            describedBy={errorId}
            onSelect={(option) => onToggleValue(question, option)}
          />
        );
    }
  };

  const labelTarget =
    question.kind === QuestionKind.SingleChoice || question.kind === QuestionKind.MultiChoice
      ? undefined
      : controlId;

  return (
    <FieldShell
      id={questionAnchorId(question.id)}
      index={persianInteger(position)}
      title={question.title}
      hint={question.hint}
      required={question.required}
      error={error}
      htmlFor={labelTarget}
      labelId={labelId}
      errorId={errorId}
      className="scroll-mt-28"
    >
      {control()}
    </FieldShell>
  );
}
