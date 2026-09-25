# Project Bible

Central source of truth for the I-RIS project vision, scope, decisions, and principles.

## Project Identity

### Name

- **Project Name:** I-RIS
- **Full Form:** Interview Response Intelligence System
- **Tagline:** Practice Interviews. Get Smarter Feedback. Improve Every Time.
- **Project Type:** AI-powered interview preparation and practice platform.

### Audience and Context

- **Primary Target Users:** Students and freshers preparing for technical job interviews.
- **Initial Focus:** Technical job interviews.
- **Primary Context:** Indian students and freshers.
- **Language Focus:** English and natural conversational Hinglish.

## Phase 0.3: Problem Definition

### Current Situation

Students preparing for interviews commonly use:

- Interview question banks
- YouTube/interview videos
- Self-practice
- Friends or classmates
- Teachers or mentors
- General AI chatbots

These resources can be useful, but studying interview questions and actually practicing an interview conversation are different activities.

A student may know a technical concept but still struggle to explain it during an actual interview, respond to unexpected follow-up questions, or understand the quality of their own answer.

### Primary Problem

Students and freshers often lack convenient, repeatable, and realistic mock interview practice with meaningful feedback.

Simple explanation:

Students can find interview questions and preparation material, but they may not have someone available to regularly conduct realistic interviews and provide useful feedback on their responses.

### Root Problems

1. **Human interviewer availability:** Students may not always have a friend, teacher, mentor, or professional available to conduct mock interviews regularly.
2. **Fixed question practice:** Many preparation methods rely on predefined questions and do not necessarily simulate a natural interview conversation with follow-up questions.
3. **Lack of useful answer feedback:** Students may not clearly know whether their answer was technically correct, whether it was relevant, what information was missing, how complete the explanation was, or how the answer could be improved.
4. **Limited adaptive practice:** A fixed question sequence does not necessarily adapt its difficulty or direction according to candidate performance.
5. **Difficulty identifying recurring weak areas:** After multiple practice sessions, candidates may not have a structured way to identify topics where they repeatedly struggle.
6. **Lack of realistic conversation practice:** Reading questions is different from practicing understanding a question, thinking about a response, explaining a concept, responding to follow-up questions, and continuing a technical conversation.

### User Pain Points

- Before an interview: "I don't know what an interviewer may ask me."
- During preparation: "I have questions to practice, but who will regularly interview me?"
- After answering: "Was my answer actually good, or does it just feel good to me?"
- After multiple practice sessions: "Which topics am I repeatedly weak in?"
- Before the actual interview: "I know the concepts, but can I explain them properly in a real conversation?"

### Existing Approaches

1. **Question Banks**
   - Useful for finding interview questions and practicing technical concepts.
   - Limitation: Usually does not provide a realistic conversational interview experience.

2. **YouTube Mock Interviews**
   - Useful for observing real interview situations and learning how candidates respond.
   - Limitation: The student is observing rather than actively being interviewed.

3. **Friends/Classmates**
   - Useful for human interaction and basic mock interview practice.
   - Limitations: Availability, different levels of technical knowledge, inconsistent evaluation, and difficulty practicing regularly.

4. **Teachers/Mentors**
   - Useful for experienced feedback and professional guidance.
   - Limitations: Limited time and availability; repeated practice sessions may not always be possible.

5. **General AI Chatbots**
   - Useful for flexible, on-demand conversation.
   - Limitation: A general chatbot is not necessarily organized around a dedicated, structured interview-practice workflow with interview sessions, adaptive questioning, structured evaluation, and progress tracking.

General AI chatbots may be capable of conducting interviews. The opportunity for I-RIS is to provide a dedicated and structured interview-practice experience.

### Gap in Existing Approaches

Different approaches solve different parts of the preparation problem:

- Question Banks -> Questions
- Videos -> Demonstration
- Friends -> Conversation
- Mentors -> Expert feedback
- General AI -> Flexible conversation

I-RIS aims to combine relevant capabilities into a focused interview-practice workflow:

Questions + Conversation + Adaptive Follow-up + Answer Analysis + Structured Feedback + Progress Tracking

### Indian Student Context

I-RIS initially focuses on Indian students and freshers. Students may naturally use English and Hindi together during technical conversations.

Example:

"Inheritance ka basic concept samajh aa gaya, but agar child class ko parent ki method modify karni ho then we can use overriding."

I-RIS therefore plans to support English and natural conversational Hinglish. Hinglish support is intended to make interaction natural and comfortable. It should not be presented as a system for judging a candidate's English ability.

### Effects of the Problem

The problem may contribute to the following pattern, though these effects are not guaranteed for every student:

Limited realistic practice -> Less exposure to follow-up questions -> Difficulty explaining concepts -> Limited understanding of weaknesses -> Repeated mistakes -> Lower interview readiness

### Why This Problem Matters

Interview preparation is not only about knowing technical answers. Candidates may also need to understand questions, construct responses, explain reasoning, communicate technical concepts, and respond to follow-up questions.

A candidate may know that recursion means a function calling itself, but an interviewer may ask what prevents the recursion from continuing indefinitely. This demonstrates why conceptual knowledge and conversational explanation are different skills.

### Project Opportunity

I-RIS provides an opportunity to create an accessible system where a student can repeatedly practice interview conversations, receive structured feedback, and track improvement without requiring a human interviewer for every practice session.

### Problem-to-Solution Mapping

- Human interviewer unavailable -> AI-based interviewer
- Fixed question practice -> Adaptive questioning
- Follow-up practice missing -> Context-aware follow-ups
- Answer quality unclear -> Structured evaluation
- Weak areas unclear -> Performance analysis
- Repeated practice difficult -> On-demand interviews
- Language may feel unnatural -> English + natural Hinglish
- Progress difficult to track -> Interview history and analytics
- Personalized resume questions difficult -> Planned resume-based interviews

Resume-based interviews are a planned future capability, not a completed or current feature.

### Problem Boundaries

I-RIS does not claim to:

- Guarantee placement
- Perfectly judge candidates
- Completely replace human interviewers
- Accurately detect personality
- Reliably determine whether someone will get a job

I-RIS is a practice and feedback tool intended to help candidates improve interview readiness.

### Formal Problem Statement

"Students and freshers preparing for technical job interviews often have limited access to convenient and repeatable mock interview practice. Existing preparation methods such as question banks, videos, and occasional peer or mentor interviews may provide knowledge or practice, but may not consistently provide adaptive questioning, contextual follow-ups, structured response feedback, and progress tracking. This creates a gap between studying interview concepts and practicing them in a realistic conversational setting. I-RIS aims to address this gap by providing an AI-powered mock interview environment where candidates can practice interviews, receive structured feedback, and track their improvement over time."

### One-line Problem Statement

"I-RIS addresses the lack of convenient and repeatable realistic mock interview practice with personalized feedback for students and freshers."

## Phase 0.4: Project Scope

### Scope Purpose

I-RIS is an AI-powered mock interview platform where students and freshers can repeatedly practice technical interviews and receive structured feedback. The system should feel like an interview conversation rather than a static question bank.

The core product loop is:

Practice -> Feedback -> Improve -> Practice Again

### Core Scope

The core system should support:

1. Mock interview sessions
2. An AI interviewer
3. Question generation or selection
4. Candidate answer processing
5. Answer analysis
6. Context-aware follow-up questions
7. Adaptive interview behavior
8. Structured feedback
9. Interview history
10. Progress tracking

### Supporting MVP Scope

The MVP should support the basic capabilities required to operate an interview session:

- User account or session access
- Interview setup
- Interview configuration
- Interview session management
- Topic or skill selection
- Difficulty selection
- Interview duration
- Language preference
- Interview mode where applicable
- Interview results
- Previous interview history
- Progress and performance tracking

These are product capabilities only. Their technical implementation is not defined in this phase.

### Interview Configuration

Before starting an interview, the candidate configures the session using:

- Interview Type
- Topic or Skill
- Difficulty
- Duration
- Language
- Interview Mode

Example configuration:

- Interview Type: Technical Interview
- Topic: Java + OOP
- Difficulty: Medium
- Duration: 15 minutes
- Language: English/Hinglish
- Mode: Practice

This phase does not define UI design, database fields, or API structures.

### Interview Lifecycle

The approved conceptual lifecycle is:

Setup -> Ready -> Active Interview -> Candidate Answer -> Answer Analysis -> Follow-up or Next Question -> Completion Check -> Closing Conversation -> Interview Completed -> Final Evaluation -> Feedback/Results -> Interview History/Progress

1. **Setup:** The candidate selects the interview configuration.
2. **Ready:** The configured session is prepared and awaiting the candidate's start action.
3. **Active Interview:** The AI interviewer conducts the interview within the configured scope.
4. **Candidate Answer:** The candidate responds to the current question.
5. **Answer Analysis:** The response is considered for the next conversational step and later feedback.
6. **Follow-up or Next Question:** The interviewer asks a contextual follow-up or moves to another relevant question.
7. **Completion Check:** The interview engine checks whether a configured completion condition has been reached.
8. **Closing Conversation:** The interviewer conducts a short, professional closing exchange instead of moving directly to a score screen.
9. **Interview Completed:** The session is closed and no further interview questions are asked.
10. **Final Evaluation:** The completed responses are evaluated.
11. **Feedback/Results:** The candidate receives structured results and feedback.
12. **Interview History/Progress:** The result becomes available for later review and progress tracking.

### AI Interviewer Scope and Lifecycle Control

The AI interviewer is responsible for conversational interview behavior. It may:

- Ask interview questions
- Understand candidate responses
- Maintain interview context
- Ask contextual follow-up questions
- Adjust questioning direction or difficulty within the configured interview scope
- Continue the interview naturally
- Conduct the closing conversation

The AI does not have unrestricted authority over the entire application or over interview termination. Normal deterministic application logic remains responsible for session state, navigation, timing, data persistence, validation, and interview lifecycle control.

The AI may assist in determining when a natural wrap-up is appropriate within the configured session boundaries, but the interview engine remains responsible for deciding and controlling lifecycle transitions.

### Answer Analysis and Structured Feedback

I-RIS should analyze candidate responses for:

- Technical correctness
- Relevance
- Completeness
- Explanation quality
- Reasoning
- Missing important points
- Areas for improvement

After the interview, structured feedback should include:

- Overall performance
- Strengths
- Weak areas
- Repeated mistakes
- Suggested improvements
- Recommended practice areas

Phase 0.4 does not define a mathematical scoring formula. Detailed scoring rules belong to the later Scoring System phase.

### Interview Completion Rules

The interview must not continue indefinitely. The interview engine controls the interview lifecycle.

#### Primary Completion Boundary

The configured interview duration is the primary automatic completion boundary for the MVP. For example, a 15-minute interview should naturally conclude around its configured duration.

The system should avoid abruptly terminating an active question or answer interaction exactly at the boundary. If the boundary is reached while an interaction is active, the current interaction should be allowed to finish gracefully before the interview closes.

#### Candidate Early Termination

The candidate may manually end the interview before the configured duration. The conceptual flow is:

Interview -> End Interview -> Confirmation -> Interview Completed -> Evaluation/Feedback

The system should require confirmation so that a single accidental action does not end the interview.

#### Sufficient Coverage and Natural Wrap-up

The system may determine that the configured interview objective has been sufficiently covered and prepare a natural wrap-up. The AI may assist with this determination within the configured session boundaries, but it must not terminate an interview whenever it wants. The interview engine remains responsible for lifecycle control.

### Interview Closing Conversation

After a completion condition is reached, I-RIS should conduct a short professional closing conversation rather than transitioning abruptly from the final question to a score screen.

The conceptual flow is:

Interview Completion -> Formal Closing -> Candidate Expected Score -> Thank You / Closing -> Evaluation -> Results

The interviewer first formally acknowledges completion and thanks the candidate. It then asks how the candidate would rate their performance and what score they expect. The response is captured as the candidate's expected score. The interviewer then gives a professional closing message before evaluation and results are shown.

Closing wording may vary, but it should remain professional, natural, and appropriate to the interview context. The final score must not be revealed during the closing conversation; it belongs to the evaluation and results stage.

### Expected Score Rule

The candidate's expected score is a self-assessment and must not influence the actual AI evaluation or final score.

Candidate Expected Score != Actual Interview Score

For example, a candidate may expect 70/100 while the actual interview score is 72/100. Comparing these values may support future self-awareness analytics, but that analytics capability is not required for the MVP and is not defined in Phase 0.4.

### Special Closing Cases

- **Normal completion:** The interviewer thanks the candidate and transitions to results.
- **Candidate ends early:** The interviewer professionally acknowledges the early termination and explains that feedback will be based on the completed portion of the session.
- **Strong or weak performance:** The closing remains professional and respectful regardless of performance.

The interviewer must not insult, shame, mock, or unnecessarily discourage the candidate. The final score is not disclosed during any closing case.

### Language Scope

I-RIS initially supports English and natural conversational Hinglish. Hinglish means natural mixed-language communication rather than literal sentence-by-sentence translation.

Example:

“Inheritance ka basic concept samajh aa gaya, but agar child class ko parent ki method modify karni ho, then we can use method overriding.”

Language support exists to make the interview interaction more natural and comfortable. It is not a measure of the candidate's English quality.

### Voice Scope

Voice interaction is part of the planned product experience. For the MVP, voice remains a controlled scope. The conceptual interaction may be:

Candidate speaks -> Speech converted to text -> Interview system processes response -> AI generates response -> Response may be presented through voice

Advanced voice capabilities may be expanded later. This phase does not select providers or define implementation architecture.

### Resume Scope

Resume-based interviews are a planned advanced or future capability, not mandatory MVP functionality. The future conceptual flow is:

Resume Upload -> Resume Information Extraction -> Skills/Projects Identification -> Personalized Question Generation -> Interview

This phase does not define resume parsing technology.

### Progress and History Scope

Candidates should be able to review previous interview performance through:

- Interview history
- Previous results
- Performance trends
- Strength areas
- Weak areas
- Improvement over repeated practice

The goal is to support the core product loop. Phase 0.4 does not define a detailed analytics algorithm.

### MVP Scope

The MVP or college version prioritizes a complete working interview loop over a large number of disconnected features. The minimum meaningful product experience is:

1. The candidate enters I-RIS.
2. The candidate configures an interview.
3. The candidate starts the interview.
4. The AI asks a question.
5. The candidate answers.
6. The system processes and analyzes the answer.
7. The AI asks a contextual follow-up or moves to the next relevant question.
8. Completion conditions are checked.
9. The interview enters the closing conversation.
10. The interviewer gives a professional closing.
11. The candidate gives an expected score.
12. The candidate receives a thank-you or closing message.
13. The system performs final evaluation.
14. The candidate receives structured feedback.
15. The interview result is saved.
16. The candidate can review interview history and progress.

### Future and Advanced Scope

The following are planned future or advanced capabilities and are not mandatory MVP scope:

- Resume-based personalized interviews
- More advanced voice interaction
- More advanced personalization
- Advanced analytics
- More interview categories
- More sophisticated adaptive intelligence
- Additional progress insights

### Out of Scope

I-RIS is not:

- A recruitment platform
- A job portal
- A hiring system
- A placement guarantee system
- A candidate rejection or hiring decision engine
- A resume builder
- A job application platform
- A coding competition platform
- A personality detection system
- A scientifically accurate facial emotion detection system
- A system that claims to replace human interviewers completely

I-RIS is fundamentally:

**Interview Practice + AI Interview Conversation + Structured Feedback + Progress Tracking**

### Phase 0.4 Decision Boundaries

This phase does not decide:

- Programming language
- Frontend framework
- Backend framework
- Database technology
- AI or LLM provider
- Speech-to-text or text-to-speech provider
- Hosting provider
- Cloud architecture
- API endpoints
- Database schema
- UI design or CSS/design system
- Authentication implementation
- Deployment implementation
- Detailed scoring formula
- Detailed adaptive algorithm

## Phase 0.5: Success Criteria

### Purpose and Success Model

Phase 0.5 defines how success for the approved I-RIS scope is observed and tested. Success criteria are realistic for the MVP and do not require perfect AI accuracy, human-level intelligence, guaranteed placement, guaranteed interview success, or perfect personality analysis.

Success is evaluated at three levels:

1. **Functional Success:** The core product capabilities work from interview setup through saved results and later review.
2. **Product Experience Success:** The interview feels coherent, useful, contextual, reasonably realistic, and respectful rather than like a static question list.
3. **Project Success:** The MVP is demonstrable, testable, documented, understandable, technically explainable, and suitable for the college project and viva.

These levels distinguish whether the system works, whether it provides a useful experience, and whether the project can be clearly demonstrated and explained.

### Core Workflow Success

The complete MVP interview loop should be demonstrable without the core workflow breaking or requiring manual developer intervention during a normal interview:

1. Enter I-RIS.
2. Configure and start an interview.
3. Receive a question and submit an answer.
4. Process and analyze the response.
5. Receive a contextual follow-up or relevant next question.
6. Continue through multiple interactions.
7. Reach a valid completion condition.
8. Enter a professional closing conversation.
9. Provide an expected score and receive a closing message.
10. Complete final evaluation and receive structured feedback.
11. Save the result and review the completed interview later.

### AI Interviewer Success

The AI interviewer should behave as a conversational interviewer. Observable success includes asking relevant questions, understanding a response sufficiently to continue, maintaining interview context, asking contextual follow-ups, moving naturally to relevant next questions, respecting configured scope, and conducting a professional closing.

Success is judged by relevance and contextual relationship, not identical wording. For example, after an answer about Java inheritance, a follow-up about method overriding demonstrates contextual behavior, while an unrelated DBMS normalization question does not.

### Adaptive Interview Success

Candidate responses should meaningfully influence subsequent questioning. A strong response may lead to a deeper question, a weak response may lead to clarification or a foundational question, and an incomplete response may lead to a follow-up for missing information. Phase 0.5 does not define a specific adaptive algorithm.

### Answer Analysis Success

For representative answers, analysis should be relevant to the actual response rather than generic advice. It should consider technical correctness, relevance, completeness, explanation quality, reasoning, missing important points, and improvement opportunities. Detailed scoring formulas remain part of the later Scoring System phase.

### Feedback Success

Final feedback should be actionable and specific enough for a candidate to identify what to improve. It should address overall performance, strengths, weak areas, repeated mistakes where sufficient history exists, suggested improvements, and recommended practice areas.

### Interview Completion Success

- The configured duration is the primary automatic completion boundary for the MVP.
- An active question or answer interaction is allowed to finish appropriately when the time boundary is reached.
- The candidate can end the interview early through a confirmed action.
- The interview engine remains responsible for lifecycle control; the AI has no unrestricted authority to terminate an interview.
- An interview does not remain active indefinitely after its configured completion conditions are reached.

### Closing Conversation Success

The interview should not jump directly from the final question to the results screen. A normally completed interview should include a professional closing that acknowledges completion, thanks the candidate, asks for and captures the candidate's expected score, provides a final closing message, and then transitions to evaluation and results. The wording may vary naturally.

The expected score is a self-assessment. Changing it must not change the actual evaluation, final score, technical assessment, or feedback quality for the same interview responses. The final score is not revealed during closing. Early termination should be acknowledged professionally, with feedback based on the completed portion of the session. Closing behavior remains respectful for strong or weak performance.

### Progress and History Success

Completed interviews can be retrieved later, with results associated with the appropriate session. Repeated interviews can be compared at a basic progress level so the candidate can understand whether performance is improving over time. Advanced analytics algorithms are not required in this phase.

### Language Experience Success

The interviewer should maintain a coherent conversation when English and natural conversational Hinglish are used. Hinglish is not treated as an English-proficiency score.

### Reliability Success

Foreseeable recoverable failures, including temporary AI or voice failure, network interruption, invalid or empty responses, and unexpected processing failure, should not unnecessarily destroy the session or corrupt already completed interview information. Detailed fallback behavior belongs to the later Error/Fallback phase.

### Usability Success

A representative first-time candidate should be able to understand what they are doing, configure and start an interview, answer, understand what happens next and when the interview ends, find feedback, and locate previous results with minimal external explanation. This criterion does not define UI or visual design.

### College Project Success

The MVP should be demonstrable, testable, documented, technically explainable, grounded in a clearly defined problem and solution, built around a coherent AI use case, capable of showing the complete interview workflow, suitable for viva explanation, and able to show future scope separately from MVP scope. A coherent working system takes priority over disconnected features.

### MVP Acceptance Checklist

- Interview setup works.
- An interview can start.
- The AI asks relevant questions.
- Candidate answers can be processed.
- Contextual follow-ups can occur.
- The interview can continue through multiple interactions.
- Completion rules work.
- Early termination requires confirmation and works.
- Active interactions finish gracefully at the duration boundary.
- A professional closing occurs.
- The candidate's expected score is captured.
- The expected score does not influence actual evaluation.
- Final evaluation is generated.
- Structured feedback is generated.
- The interview result is saved.
- Interview history can be reviewed.
- Basic progress can be observed.
- Recoverable failures are handled reasonably.
- The complete workflow can be demonstrated without developer intervention.

### Future Scope and Later Testing

Full resume-based interviews, advanced voice capabilities, advanced personalization, advanced analytics, many interview categories, and highly sophisticated adaptive algorithms are future or advanced capabilities, not mandatory MVP success criteria.

Phase 0.5 establishes high-level success and acceptance criteria. Later testing phases will convert them into detailed test cases, test scenarios, integration tests, user tests, bug reports, and acceptance validation. No such tests are defined or created in this phase.

## Phase 0.6: Master Project Rules

### Purpose

These rules govern how I-RIS is designed, documented, developed, reviewed, tested, and changed. They apply throughout the project unless explicitly superseded by a later approved project decision. Their purpose is to prevent random architecture changes, uncontrolled AI-generated code, scope creep, conflicting implementations, broken contracts, unnecessary dependencies, poor documentation, unreviewed AI decisions, unclear responsibilities, and code the team cannot explain.

### Source of Truth

Project documentation is the authoritative source of approved project decisions. The general hierarchy is:

PROJECT-BIBLE.md -> REQUIREMENTS.md -> Approved architecture and contracts -> Implementation

If generated code, an AI response, a team suggestion, or an informal conversation conflicts with an approved documented decision, the approved documented decision takes precedence until an explicit change is reviewed, approved, and documented. AI output is not authoritative.

### Decision Authority

Project-level decisions are centrally controlled. The project owner or lead acts as the primary architect, integrator, and final decision authority for major decisions.

Team members may suggest improvements, propose alternatives, implement approved tasks, report problems, and review work. They must not independently redefine the overall architecture, core scope, major workflows, API contracts, database structure, core AI behavior, security architecture, or technology stack. A proposal is not automatically an approved decision.

### AI Agent Role

AI agents are development assistants, not autonomous project architects. They may explain code, generate code for approved tasks, debug existing code, suggest refactoring, generate tests, help write documentation, identify potential bugs, and suggest technical alternatives.

AI agents must not independently add major features, expand scope, redesign architecture or the database, replace the technology stack, change API contracts, rewrite major modules without authorization, make security architecture decisions, introduce unrelated dependencies, change established product behavior, or decide that an approved requirement is unnecessary.

An AI agent may recommend a project-level change, but it cannot implement that change merely because it believes the alternative is technically better. The change must first be reviewed, approved, and documented.

### Read-Before-Write

Every AI agent and developer must understand relevant existing context before modifying it:

READ -> UNDERSTAND -> PLAN -> MODIFY -> VERIFY

Relevant documentation, contracts, and implementation must be inspected before changes are made.

### Task and File Boundaries

Every meaningful development task should specify its objective, relevant context, expected behavior, allowed files or areas, restricted files or areas, dependencies, and verification requirements. Tasks should be small enough to have clear responsibility.

AI agents and developers must modify only the files necessary for their assigned task. Additional files should be reported with the reason they are necessary rather than silently included. Unrelated files must remain untouched, and file boundaries must be checked after the work.

### Documentation-First Development

Major features should follow this conceptual order:

Requirement -> Workflow -> Architecture -> API Contract -> Database/Data Design -> Implementation -> Testing

Implementation must follow approved higher-level decisions. Small implementation details may be decided during coding when they remain consistent with those decisions.

### Scope Change Control

No new major feature may enter the project silently. A proposal outside the approved scope follows:

Idea -> Scope Change Proposal -> Impact Analysis -> Decision -> Documentation Update -> Implementation

This applies to new capabilities, AI capabilities, user roles, workflows, integrations, and major changes to interview behavior. A rejected proposal remains outside project scope.

### Architecture Change Control

Existing architecture decisions must not be casually replaced. A proposed alternative should document the current approach, proposed approach, reason, advantages, disadvantages, impact, and migration implications. Approval is required before implementation, followed by updates to relevant documentation.

### Contract Protection

Approved user workflows, API contracts, database schemas, AI behavior, voice behavior, scoring systems, and interview lifecycle rules must not be casually broken by individual tasks. Contract changes follow:

Proposal -> Review -> Approval -> Documentation -> Implementation

Code must not silently become the source of a new contract.

### Verification and Completion

A feature is not complete merely because code was generated. The completion process is:

Implemented -> Verified -> Tested -> Accepted -> DONE

Verification checks intended behavior, unnecessary regressions, requirement satisfaction, relevant checks, and unintended file changes. Detailed testing procedures belong to later testing phases.

### Bug Versus Feature

A bug is approved existing behavior that does not work correctly and should be fixed. A feature is new behavior that was not previously approved and requires appropriate approval. An unapproved feature must not be described as a bug fix to bypass scope control.

### AI-Generated Code Review

AI-generated code must be reviewed before acceptance. Review considers requirement and architecture alignment, compatibility with existing code, file scope, dependencies, security, performance, maintainability, readability, and whether the team can explain the code. AI-generated does not mean automatically correct; important project logic must not be merged blindly.

### Team Collaboration

I-RIS uses centralized decisions with decentralized execution. The project lead or architect controls major decisions, while team members independently execute clearly scoped approved tasks. Team members should communicate conflicts, dependencies, and blockers rather than independently changing shared architecture.

### AI Agent Handoff

When one AI agent hands work to another, the next agent must inspect the current project state and relevant documentation before continuing:

Current State -> Read -> Verify -> Continue

Agents must not assume previous work was implemented correctly. If previous work conflicts with approved documentation, the conflict must be reported rather than silently resolved by choosing a new direction.

### Security

Security decisions must not be improvised by individual agents. This includes API keys, authentication, user data, interview responses, resume data, AI prompts, configuration secrets, and external service credentials. Secrets must never be hardcoded into source code. Detailed security architecture will be defined later.

### AI Cost and Performance Awareness

AI should be used where intelligence is required, while deterministic application logic handles deterministic operations such as navigation, basic validation, session state, timers, data persistence, and standard UI state. Do not introduce AI or expensive processing merely because it is possible. Consider the impact of new AI calls, large data processing, repeated requests, external services, and heavy client-side operations. Detailed cost management and performance optimization will be addressed later.

### Dependency Management

Packages, libraries, frameworks, and external services must not be added randomly. Before adding a dependency, consider why it is needed, whether existing capabilities are sufficient, maintenance, security, performance, and whether approval is required. Do not add dependencies merely because an AI-generated solution uses them.

### Maintainability and Understandability

I-RIS should remain understandable to its student development team. Prioritize clear naming, consistent structure, understandable modules, reasonable abstractions, maintainable code, useful comments where necessary, and minimal unexplained AI-generated logic. The project must remain explainable during demonstration and viva.

### Project Knowledge and Traceability

Important decisions must be documented rather than existing only in one developer's memory or one AI conversation. Meaningful changes should identify what changed, why it changed, what decision authorized it, and which documentation and implementation are affected. The existing CHANGELOG.md may later be used for appropriate change tracking; no new changelog system is created in this phase.

### No Random Refactoring or Unauthorized Cleanup

AI agents must not perform large unrelated refactoring while completing a focused task. Unrelated files must not be changed merely because they appear old, messy, unused, or better suited to another structure. Potential cleanup opportunities should be reported separately.

### Error and Uncertainty

When uncertain about an important project decision, an AI agent must check existing documentation and contracts, identify the uncertainty, and ask for clarification or report the conflict. It must not invent an answer and treat it as approved, especially for architecture, scope, security, data handling, AI behavior, or API contracts.

### Project Consistency

All project components must remain consistent with the Problem Definition, Project Scope, Success Criteria, approved workflows, and approved contracts. No component should independently evolve into a different product.

### Definition of Done

A task is DONE only when the approved requirement is satisfied, implementation is complete, relevant verification and testing have passed, no unintended files were changed, required documentation is updated, the implementation remains consistent with project architecture, and the responsible team member can explain the change. Detailed Phase 28 Definition of Done will later expand this principle into a formal completion framework.

### AI Agent Standard Operating Pattern

The default AI-assisted development workflow is:

1. **Read:** Understand relevant documentation and current implementation.
2. **Identify:** Determine the exact assigned task and boundaries.
3. **Plan:** Describe the intended change before broad modification.
4. **Implement:** Modify only approved areas.
5. **Verify:** Check behavior, consistency, diagnostics, and file boundaries.
6. **Report:** Clearly report what changed, why, files changed, verification, uncertainty, and blockers. Unexpected changes must not be hidden.

### Project Governance Principle

The governing principle for I-RIS is:

**Centralized architecture and decisions + decentralized execution + controlled AI assistance + documented change management.**

### Problem and Solution

**Core Problem:** Students can study interview questions and concepts, but often lack access to realistic interview practice, contextual follow-up questions, and useful feedback on their answers.

**Core Solution:** I-RIS is an AI-powered mock interview platform that conducts adaptive, conversational interviews and provides structured feedback to help candidates improve their interview performance.

**Core Product Experience:** Practice -> Feedback -> Improve -> Practice Again

### Core Interview Flow

The candidate starts an interview. I-RIS asks a question, and the candidate answers. The answer is analyzed, I-RIS decides the appropriate next step, and it asks a relevant follow-up or next question. The interview continues until the final performance is analyzed and the candidate receives a structured report.

### Planned Differentiators

1. Natural Indian conversational interview experience using English and Hinglish.
2. Adaptive interviews where question difficulty and direction can change based on performance.
3. Context-aware follow-up questions instead of only asking a fixed sequence of questions.
4. Structured feedback on interview responses.
5. Interview history and progress tracking.
6. Future support for resume-based personalized interviews.

### AI Role

AI will provide the intelligence required for interview question generation and selection, answer analysis, contextual follow-ups, adaptive questioning, and feedback generation.

### Scope Boundary

I-RIS is primarily an interview practice and improvement platform. It is **not** an actual recruitment platform, job portal, hiring system, resume builder, coding platform, personality detector, facial emotion detector, or candidate hiring recommendation system.

### Objectives

#### Primary Objective

To develop an AI-powered mock interview platform that enables students and freshers to practice realistic technical interviews through adaptive conversations, contextual follow-up questions, voice interaction, and structured performance feedback.

#### Secondary Objectives

1. Provide interview practice without requiring a human interviewer.
2. Simulate a realistic conversational interview environment.
3. Analyze technical interview answers.
4. Generate relevant follow-up questions.
5. Adapt the interview according to candidate performance.
6. Support English and natural Hinglish interaction.
7. Identify strengths and weaknesses.
8. Maintain interview history.
9. Show improvement over time.
10. Eventually support resume-based personalized questions.

### Vision

A student should be able to sit alone with a laptop, start I-RIS, and experience something meaningfully closer to being interviewed by a real person than simply answering questions from a list.
