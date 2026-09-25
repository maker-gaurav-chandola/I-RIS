export type QuestionProvider = {
  getQuestion: (index: number) => string | null;
  count: number;
};

const questions = [
  "Explain the main concept behind the topic you selected.",
  "Describe one practical example related to that topic.",
  "What common mistake should someone avoid when working with that topic?",
];

export function createQuestionProvider(): QuestionProvider {
  return {
    count: questions.length,
    getQuestion: (index) => questions[index] ?? null,
  };
}
