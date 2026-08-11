import { isChoiceQuestion, type QuestionId } from "@survey/domain/entities/question.entity";
import type { SurveyDefinition } from "@survey/domain/entities/survey-definition.entity";
import {
  BACKEND_KEYWORD,
  BACKEND_VALUE,
  REQUEST_FIELD_ALIAS,
  UNMAPPED_QUESTIONS,
} from "@survey/infrastructure/contract/backend-contract";
import {
  BACKEND_VALUE_TRANSLATION,
  toBackendValue,
} from "@survey/infrastructure/mappers/backend-value.map";

const ENUM_CONSTRAINED: Partial<Record<QuestionId, readonly string[]>> = {
  gender: Object.values(BACKEND_VALUE.gender),
  cancer_history: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  hookah_ecig: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  adds_salt: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  smoked_food: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  air_pollution: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  occupational_hazard: [BACKEND_VALUE.yes, BACKEND_VALUE.no],
  alcohol: Object.values(BACKEND_VALUE.alcohol),
  hot_drink_temp: Object.values(BACKEND_VALUE.hotDrink),
  junk_food: Object.values(BACKEND_VALUE.junkFood),
  processed_meat: Object.values(BACKEND_VALUE.processedMeat),
  veg_fruit: Object.values(BACKEND_VALUE.vegFruit),
};


const KEYWORD_MATCHED: readonly {
  questionId: QuestionId;
  keyword: string;
  expectedMatches: number;
}[] = [
  {
    questionId: "physical_activity",
    keyword: BACKEND_KEYWORD.lowPhysicalActivity,
    expectedMatches: 1,
  },
  { questionId: "h_pylori", keyword: BACKEND_KEYWORD.activeHPylori, expectedMatches: 1 },
];

const collectProblems = (definition: SurveyDefinition): string[] => {
  const problems: string[] = [];
  const unmapped = new Set<QuestionId>(UNMAPPED_QUESTIONS);

  for (const question of definition.allQuestions()) {
    if (unmapped.has(question.id)) continue;

    if (!REQUEST_FIELD_ALIAS[question.id as keyof typeof REQUEST_FIELD_ALIAS]) {
      problems.push(`"${question.id}" has no backend alias and is not listed as unmapped.`);
    }

    if (!isChoiceQuestion(question)) continue;

    const translation = BACKEND_VALUE_TRANSLATION[question.id];
    const allowed = ENUM_CONSTRAINED[question.id];

    for (const option of question.options) {
      if (translation && !(option.value in translation)) {
        problems.push(
          `"${question.id}" option "${option.value}" has no entry in BACKEND_VALUE_TRANSLATION.`,
        );
        continue;
      }

      if (!allowed) continue;

      const sent = toBackendValue(question.id, option.value);
      if (!allowed.includes(sent)) {
        problems.push(
          `"${question.id}" option "${option.value}" maps to "${sent}", which the backend enum rejects.`,
        );
      }
    }
  }

  for (const { questionId, keyword, expectedMatches } of KEYWORD_MATCHED) {
    const question = definition.question(questionId);
    if (!isChoiceQuestion(question)) continue;

    const matches = question.options.filter((option) => option.value.includes(keyword));
    if (matches.length !== expectedMatches) {
      problems.push(
        `"${questionId}" should have exactly ${expectedMatches} option(s) containing "${keyword}", found ${matches.length}.`,
      );
    }
  }

  return problems;
};

export const assertContractCoverage = (
  definition: SurveyDefinition,
  { throwOnFailure }: { throwOnFailure: boolean },
): void => {
  const problems = collectProblems(definition);
  if (problems.length === 0) return;

  const report = [
    "Survey contract drift detected between the UI and backend/models.py:",
    ...problems.map((problem) => `  • ${problem}`),
  ].join("\n");

  if (throwOnFailure) throw new Error(report);
  console.error(report);
};
