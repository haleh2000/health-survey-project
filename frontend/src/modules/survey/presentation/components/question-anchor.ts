import type { QuestionId } from "@survey/domain/entities/question.entity";

/**
 * DOM id of a rendered question.
 *
 * Shared so that the "jump to the first invalid answer" behaviour and the
 * element that answers to it can never disagree about the id format.
 */
export const questionAnchorId = (id: QuestionId): string => `field-${id}`;
