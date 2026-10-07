export type QuestionProvider = {
  getQuestion: (index: number) => string;
};

const questions = [
  "Explain the main concept behind the topic you selected.",
  "Describe one practical example related to that topic.",
  "What common mistake should someone avoid when working with that topic?",
  "How would you explain this topic to someone who has never heard of it?",
  "Describe a situation where this topic would be especially important.",
  "What is one common misconception about this topic and why is it wrong?",
  "How does this topic connect to other related concepts in the field?",
  "What would you consider the most important thing to remember about this topic?",
];

export function createQuestionProvider(): QuestionProvider {
  return {
    getQuestion: (index) => questions[index % questions.length]!,
  };
}
