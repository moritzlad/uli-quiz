import type { Question } from "./game";
import questionsData from "./questions.json";

export const sampleQuestions: Question[] = questionsData.questions.map((q) => {
  const correctIndex = q.choices.findIndex(
    (c) => c.id === q.correctChoiceId
  ) as 0 | 1 | 2 | 3;
  return {
    text: q.prompt,
    opts: q.choices.map((c) => c.label) as [string, string, string, string],
    correctIndex,
    category: q.category,
  };
});
