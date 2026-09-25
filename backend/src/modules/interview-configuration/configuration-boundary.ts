export type InterviewConfigurationBoundary = {
  validate: () => never;
};

export function createInterviewConfigurationBoundary(): InterviewConfigurationBoundary {
  return {
    validate: () => {
      throw new Error("Interview configuration is not implemented in Step 1.");
    },
  };
}
