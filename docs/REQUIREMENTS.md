# Requirements

Product and technical requirements for the Mana project.

## Phase 0.3 Problem-Derived Requirements

The eventual system should:

- Allow a student or fresher to start a mock technical interview on demand.
- Support an interview conversation in English and natural conversational Hinglish.
- Present relevant interview questions and accept candidate responses.
- Ask context-aware follow-up questions when appropriate.
- Adapt the direction or difficulty of the interview according to candidate performance.
- Analyze interview responses for technical correctness, relevance, completeness, missing information, and possible improvement.
- Provide structured feedback after interview responses and at the end of an interview.
- Help candidates identify recurring weak topics across practice sessions.
- Maintain interview history and show progress over time.
- Support repeated practice without requiring a human interviewer for every session.

Resume-based personalized interviews are a planned future capability and are not a current requirement for the completed system.

## Phase 0.4 Project Scope Requirements

The system should:

- Provide mock interview sessions for students and freshers preparing for technical job interviews.
- Provide an AI interviewer that conducts a conversational interview within the configured session scope.
- Allow a candidate to access a session, configure an interview, and start it when ready.
- Support configuration of interview type, topic or skill, difficulty, duration, language, and interview mode where applicable.
- Support English and natural conversational Hinglish interaction.
- Present relevant questions through generation or selection and accept candidate answers.
- Process candidate answers and maintain the context needed for the interview conversation.
- Analyze answers for technical correctness, relevance, completeness, explanation quality, reasoning, missing important points, and areas for improvement.
- Ask context-aware follow-up questions or move to a relevant next question.
- Adjust questioning direction or difficulty within the configured interview scope based on candidate performance.
- Manage interview session state, timing, validation, and lifecycle transitions.
- Use the configured duration as the primary automatic completion boundary for the MVP.
- Allow an active interaction to finish gracefully when the duration boundary is reached.
- Allow the candidate to end an interview early through a confirmed action.
- Base early-termination feedback on the completed portion of the session.
- Support a natural wrap-up when the configured interview objective is sufficiently covered, while keeping interview lifecycle control outside unrestricted AI authority.
- Conduct a short, professional closing conversation before evaluation and results.
- Ask for and capture the candidate's expected score as a self-assessment.
- Keep the candidate's expected score separate from the actual evaluation and final score.
- Avoid revealing the final score during the closing conversation.
- Provide final structured feedback including overall performance, strengths, weak areas, repeated mistakes, suggested improvements, and recommended practice areas.
- Keep closing behavior professional and respectful regardless of performance or how the interview ended.
- Save interview results and provide interview history, previous results, performance trends, strength areas, weak areas, and improvement tracking.
- Support a controlled voice interaction experience as part of the planned product experience.

The MVP should prioritize a coherent end-to-end interview loop from setup through history and progress. Detailed scoring formulas, adaptive algorithms, analytics algorithms, and implementation choices are outside these requirements.

### Future or Advanced Requirements

The following are planned future capabilities rather than mandatory MVP requirements:

- Resume-based personalized interviews
- More advanced voice interaction
- More advanced personalization
- Advanced analytics
- More interview categories
- More sophisticated adaptive intelligence
- Additional progress insights

### Scope Exclusions

The system is not required to provide recruitment, job-portal, hiring, placement-guarantee, candidate hiring-decision, resume-builder, job-application, coding-competition, personality-detection, or scientifically accurate facial-emotion-detection functionality. It must not claim to completely replace human interviewers.

## Phase 0.5 Success Criteria Requirements

The system should:

- Support a complete demonstrable workflow from interview configuration through saved results and later review.
- Allow candidate responses to influence subsequent questioning in a meaningful, contextually relevant way.
- Provide response analysis that is relevant to the candidate's actual answer and considers correctness, relevance, completeness, explanation quality, reasoning, missing points, and improvement opportunities.
- Provide actionable final feedback covering overall performance, strengths, weak areas, repeated mistakes where history allows, suggested improvements, and recommended practice areas.
- Use configured duration as the primary automatic completion boundary for MVP sessions.
- Allow active interactions to finish appropriately when the configured duration boundary is reached.
- Require confirmation before early interview termination.
- Prevent interviews from remaining active indefinitely after completion conditions are reached.
- Keep interview lifecycle control with the interview engine rather than unrestricted AI authority.
- Include a professional closing conversation before evaluation and results.
- Capture the candidate's expected score as a self-assessment without using it in actual evaluation, final scoring, technical assessment, or feedback quality.
- Avoid revealing the final score during the closing conversation.
- Preserve completed interview results for later retrieval and basic progress comparison.
- Support coherent English and natural conversational Hinglish interaction without treating Hinglish as an English-proficiency score.
- Handle foreseeable recoverable failures without unnecessarily destroying the session or corrupting completed interview information.
- Enable a representative first-time candidate to complete the intended MVP workflow with minimal external explanation.

### MVP Acceptance Checklist

- Interview setup works.
- Interview can start.
- Relevant questions are asked.
- Answers are processed.
- Contextual follow-ups can occur.
- Multiple interactions can continue.
- Completion rules work.
- Early termination works with confirmation.
- Active interactions finish gracefully.
- Professional closing occurs.
- Expected score is captured and kept independent from evaluation.
- Final evaluation and structured feedback are generated.
- Results are saved and history can be reviewed.
- Basic progress can be observed.
- Recoverable failures are handled reasonably.
- The complete workflow can be demonstrated without developer intervention.

These are high-level behavior-focused criteria. Detailed test cases, test scenarios, integration tests, user tests, bug reports, acceptance validation, scoring formulas, adaptive algorithms, and implementation decisions belong to later phases.

## Phase 0.6 Master Project Rules Requirements

The project must maintain documented authority for approved requirements, workflows, contracts, and implementation constraints. When conflicts occur, approved project documentation takes precedence over generated code, AI output, informal suggestions, or undocumented decisions.

The system and its development process must:

- Keep interview behavior consistent with the approved Problem Definition, Project Scope, and Success Criteria.
- Keep session state, lifecycle control, validation, timing, persistence, and other deterministic control separate from unrestricted AI authority.
- Preserve approved user workflows and contracts unless a documented change is reviewed and approved.
- Protect user data, interview responses, resume data, prompts, and credentials from undocumented or insecure handling; secrets must not be hardcoded.
- Avoid introducing unrelated dependencies or expensive processing without a documented need and appropriate approval.
- Preserve completed information and existing approved behavior when making changes.
- Make meaningful changes traceable to their reason, authorization, affected documentation, and affected implementation.
- Require verification that assigned behavior works and that unintended files or unrelated areas were not changed.
- Keep future capabilities separate from MVP requirements and approved project scope.

These are project and system constraints, not technology selections. Detailed architecture, security design, contracts, testing procedures, and the formal Definition of Done are defined in later phases.
