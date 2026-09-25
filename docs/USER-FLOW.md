# User Flow

Primary user journeys and interaction flows for the Mana project.

## Phase 1.1: Complete User Journey

### Purpose

This document defines the product behavior for the journey from entering I-RIS through account access and authentication to the Dashboard. It does not define UI design, authentication technology, APIs, database structure, or implementation details.

The journey supports the approved I-RIS purpose: helping students and freshers begin realistic technical interview practice and later review interview results and progress.

## Journey Overview

Landing / Entry -> Login / Account -> Authentication -> Dashboard

The journey has two primary successful entry paths:

- A first-time or unauthenticated user enters I-RIS and proceeds through account access.
- A returning authenticated user is recognized and proceeds to the Dashboard.

An unauthenticated returning user follows the same account-access path as a first-time user. A failed authentication attempt returns to the account-access state with a recoverable explanation.

## Stage 1: Landing / Entry

### User sees

The user understands that I-RIS is an AI-powered mock interview practice and feedback platform for students and freshers preparing for technical interviews. The entry point communicates the core product loop: Practice -> Feedback -> Improve -> Practice Again.

The user can understand that I-RIS supports realistic interview conversation, structured feedback, and later review of interview history and progress. The entry state does not promise placement, employment, perfect evaluation, or complete replacement of human interviewers.

### User action

The user may choose to continue to account access. A returning authenticated user may continue to the Dashboard when the existing session is valid. A returning unauthenticated user proceeds to Login / Account.

### System action

The system determines whether an existing authenticated session is available and valid for the current entry. It routes the user either to the Dashboard or to Login / Account. It preserves the user's ability to recover from an unavailable or invalid session without losing unrelated completed interview information.

### AI action

AI is not needed for entry routing, session recognition, or navigation. These are deterministic application responsibilities.

### State change

The application records the current journey state as entry and determines whether the user is unauthenticated or has an authenticated session. No interview session is started at this stage.

### Next state

- Valid returning authenticated session -> Dashboard
- First-time user or unauthenticated returning user -> Login / Account
- User chooses not to continue -> Remains at entry or exits I-RIS

### Errors / failure cases

- A session cannot be recognized: explain that account access is required and route to Login / Account.
- Entry content cannot be loaded: preserve the entry state and provide a retry or exit path.
- A temporary network or service problem occurs: provide a recoverable message without creating an interview session.

Errors should not imply that the user has lost interview history or progress unless that loss is actually established.

### Exit / navigation

The user may leave I-RIS from the entry state. A user who is routed to Login / Account may return to the entry state before completing account access. No logout action is needed at this stage.

## Stage 2: Login / Account

### User sees

The user understands that account access is required to continue to a personalized Dashboard and to associate interview results, history, and progress with the appropriate account or session. The account-access state provides a clear path for an existing user to continue and for a first-time user to create or begin the required account access, without adding unrelated account features.

### User action

The user provides the information required for the approved account-access flow and submits it for authentication. The user may cancel, go back to Landing / Entry, or correct the provided information after a recoverable validation problem.

### System action

The system validates that the submitted account-access information is usable, starts the authentication process, and prevents the user from proceeding as authenticated until authentication succeeds. It preserves already completed information and does not start an interview before authentication is complete.

### AI action

AI is not needed for account access, input validation, authentication initiation, or navigation. These are deterministic application responsibilities. AI must not make authentication or account-authorization decisions.

### State change

The user moves from unauthenticated entry to an account-access-in-progress state. The submitted account-access attempt is associated with the current journey, but the user is not yet treated as authenticated.

### Next state

- Valid account-access submission -> Authentication
- Cancel or back -> Landing / Entry
- Recoverable validation problem -> Login / Account with the input available for correction

### Errors / failure cases

- Required account-access information is missing or invalid: explain what must be corrected and keep the user in the account-access state.
- The account-access request cannot be submitted: provide a retry path without treating the user as authenticated.
- The user cancels: return to Landing / Entry without creating an interview session.

The journey does not define account fields, account roles, authentication technology, or implementation behavior.

### Exit / navigation

Back or cancel returns to Landing / Entry. The user cannot navigate to the authenticated Dashboard as an authenticated user until the Authentication stage succeeds.

## Stage 3: Authentication

### User sees

The user understands that I-RIS is checking the submitted account access and that the result will determine whether they may continue to the Dashboard. The state provides clear outcome feedback without exposing sensitive information.

### User action

The user waits for the authentication outcome. If authentication fails, the user may retry with corrected information, return to Login / Account, or return to Landing / Entry.

### System action

The system determines whether authentication succeeds or fails, records the corresponding authenticated or unauthenticated state, and routes the user accordingly. On success, it establishes the session context needed for the Dashboard. On failure, it keeps the user unauthenticated and provides a recoverable path.

Authentication outcome handling is deterministic application behavior. The system must not expose credentials or sensitive account information in error messages.

### AI action

AI is not needed for authentication, authentication outcome decisions, session establishment, or routing. AI must not authenticate users, authorize access, or override a failed authentication outcome.

### State change

- Success: unauthenticated or account-access-in-progress -> authenticated session
- Failure: account-access-in-progress -> unauthenticated with an authentication failure state

No interview session is created merely by authenticating.

### Next state

- Successful authentication -> Dashboard
- Failed authentication -> Login / Account
- User cancels or leaves the flow -> Landing / Entry

### Errors / failure cases

- Invalid account information: explain that authentication did not succeed and allow retry.
- Temporary service or network interruption: preserve the unauthenticated state and allow retry.
- Authentication expires or becomes invalid while routing: return to Login / Account and explain that authentication is required again.
- Unexpected authentication failure: show a safe, recoverable message without exposing sensitive details.

Failed authentication must not be presented as successful and must not grant Dashboard access as an authenticated user.

### Exit / navigation

The user may retry, return to Login / Account, or leave to Landing / Entry. Back navigation must not convert a failed or cancelled authentication attempt into an authenticated state.

## Stage 4: Dashboard

### User sees

Immediately after reaching the Dashboard, the authenticated user understands:

- Their current interview-related status
- How to start a new mock interview
- Where to find previous interview results and history
- Where to review basic progress and performance trends
- What the clearest next action is

For a first-time authenticated user with no completed interviews, the Dashboard explains that no previous results or progress history is available yet and makes starting the first interview the clear next action. For a returning authenticated user, it presents the available history and progress from completed interviews and makes starting another practice session clear.

The Dashboard does not introduce recruitment, job applications, resume-based interviews, or other features outside the approved MVP scope.

### User action

The user may start interview setup for a new mock interview, open previous interview results or history, review available progress, or log out. The user may navigate among these already approved interview-related destinations without changing the approved product scope.

### System action

The system confirms that the user has an authenticated session, presents the current interview-related state, and makes approved interview setup, history, results, and progress available. It retrieves or displays only the information appropriate to the authenticated account or session. It does not start an interview until the user chooses to begin setup or start an interview through the approved interview flow.

### AI action

AI is not needed to authenticate the user, route to the Dashboard, display history, display progress, or manage logout. These are deterministic application responsibilities.

AI may become involved only after the user deliberately enters the approved interview workflow, where it can perform its defined interviewer responsibilities. It does not control Dashboard navigation, session state, or account access.

### State change

The user is in an authenticated Dashboard state. The Dashboard does not itself create an interview session. Choosing interview setup begins the transition toward the approved interview configuration state; choosing history or progress opens the corresponding approved review state; choosing logout ends the authenticated state.

### Next state

- Start a new interview -> Interview Setup
- Open previous results or history -> Interview History / Results
- Review progress -> Progress / Performance Review
- Logout -> Landing / Entry or unauthenticated entry state
- Remain on Dashboard -> Authenticated Dashboard

Interview Setup, Interview History / Results, and Progress / Performance Review are references to approved Phase 0.4 capabilities and are not expanded into new features here.

### Errors / failure cases

- The authenticated session is no longer valid: preserve the user as unauthenticated and route to Login / Account.
- History or progress cannot be loaded: keep the user on the Dashboard, explain the unavailable section, and provide retry or return navigation.
- A new interview cannot be started: preserve the Dashboard state and explain that setup could not begin; do not create a partial interview session.
- A temporary network or service problem occurs: preserve available completed information and provide a recoverable retry path.
- No completed interviews exist: show an understandable empty state and direct the user toward starting an interview.

### Exit / navigation

The user may return to the Dashboard from approved history, results, progress, or interview setup states. Logout ends the authenticated session and returns the user to Landing / Entry or the unauthenticated entry state. Closing or leaving I-RIS does not imply that an interview was started or completed.

## First-Time and Returning User Behavior

### First-time user

The user enters through Landing / Entry, proceeds to Login / Account, completes authentication, and reaches an empty or introductory Dashboard state. The Dashboard clearly directs the user to configure and start the first mock interview.

### Returning authenticated user

The system recognizes the valid authenticated session and routes the user directly to the Dashboard. The user can see available interview-related status, previous results or history, progress, and the action to start another interview.

### Returning unauthenticated user

The user enters through Landing / Entry and is routed to Login / Account because no valid authenticated session is available. After successful authentication, the user reaches the Dashboard associated with the appropriate account or session.

### Failed authentication

The user remains unauthenticated, receives a safe and understandable failure message, and can retry, correct the account-access information, return to entry, or leave I-RIS. Failed authentication does not grant Dashboard access.

## Journey Consistency Rules

- The journey serves interview practice, structured feedback, history, and progress defined in Phases 0.3 and 0.4.
- First-time usability follows the Phase 0.5 expectation that a representative user can understand what to do and what happens next with minimal external explanation.
- Authentication, navigation, session state, timing, validation, and persistence remain deterministic application responsibilities under Phase 0.4 and Phase 0.6.
- AI is used only where approved interview intelligence is required and does not own account access or deterministic lifecycle control.
- No technology, API, database, UI, visual-design, infrastructure, or new product-feature decision is made here.

## Phase 1.2: Dashboard to Interview Setup

### Purpose and Boundary

This phase extends the approved Phase 1.1 journey from the authenticated Dashboard to the beginning of Interview Setup:

Dashboard -> Start Interview -> Interview Setup / Configuration Begins

Phase 1.2 ends when Interview Setup / Configuration has been entered and is ready for the user to configure the interview. It does not define the detailed configuration completion flow, validation of the complete configuration, interview readiness, or interview start. Those behaviors belong to a later phase.

### Dashboard Entry State

The Dashboard is the authenticated starting point for this journey. The user understands their current interview-related state, sees whether previous interview results or progress are available, and has a clear primary action to start a new mock interview.

The Dashboard continues to provide access to the already-approved History and Progress capabilities. It does not add unrelated account, recruitment, job application, resume, or other product features.

#### First-time user

A first-time authenticated user with no completed interviews sees an understandable empty history/progress state and understands that starting an interview is the next useful action. No previous interview data is invented or implied.

#### Returning user

A returning authenticated user can understand the available interview-related status, review previous results or history, review basic progress, and choose to start another practice session.

#### No previous interview data

When no completed interview data exists, the system explains that history and progress are not yet available and keeps Start Interview as the clear next action. The absence of data does not prevent the user from beginning a new interview setup.

## Stage 5: Start Interview Action

### User sees

The user understands that choosing Start Interview begins a new mock interview setup. The action does not immediately begin the interview conversation, ask an AI question, or create a completed interview result. The user understands that interview details will be configured before the interview can begin.

### User action

The authenticated user chooses Start Interview from the Dashboard. If the user changes their mind before setup is ready, they may go back or cancel and return to the Dashboard without completing or starting an interview.

### System action

The system confirms that the user is still authenticated, creates or prepares the journey state needed to enter a new interview setup, and routes the user to Interview Setup / Configuration. It preserves existing completed history and progress and does not begin the active interview until the later approved configuration and start flow is completed.

Navigation and interview-session lifecycle control are deterministic application responsibilities.

### AI action

AI is not needed to respond to the Start Interview navigation action, verify account access, prepare the setup state, or control the transition. AI must not decide whether the user is allowed to enter setup and must not start the interview conversation at this point.

### State change

The authenticated Dashboard state changes to an Interview Setup / Configuration-in-progress state for a new potential interview. This is not yet an active interview, and no candidate answer, evaluation, feedback, or completed result exists from this action alone.

### Next state

- Start Interview succeeds -> Interview Setup / Configuration Begins
- User goes back or cancels before setup begins -> Authenticated Dashboard
- Authentication is no longer valid -> Login / Account

### Errors / failure cases

- The authenticated session is no longer valid: preserve the user as unauthenticated and route to Login / Account; do not enter setup as an authenticated user.
- Setup cannot be entered: keep the user on the Dashboard, explain that interview setup could not begin, and provide a retry path.
- A temporary network or service problem occurs: preserve available history and progress and allow the user to retry without creating a partial active interview.
- A duplicate or interrupted start action occurs: keep one clear setup state or return safely to the Dashboard; do not create multiple unintended interview sessions.

Failures should not erase completed interview results or imply that an interview started when setup was not successfully entered.

### Exit / navigation

Back or cancel before configuration is ready returns the user to the authenticated Dashboard. Leaving I-RIS before configuration is complete does not mean that an interview was started or completed. The user may later return to the Dashboard and choose Start Interview again.

## Stage 6: Interview Setup / Configuration Begins

### User sees

The user understands that they have entered the setup state for a new mock interview and that configuration must be completed before the interview can begin. The setup scope is clear and limited to the approved interview configuration:

- Interview Type
- Topic or Skill
- Difficulty
- Duration
- Language
- Interview Mode

The user is not yet shown an active interview question or final result. This stage does not assume that any configuration value has been completed or accepted.

### User action

The user begins reviewing or providing the approved interview configuration. Detailed control behavior, completion rules, and the action that confirms the complete configuration are outside Phase 1.2.

### System action

The system presents the user with the Interview Setup / Configuration state, retains the relationship to the authenticated user or session, and prepares the journey for configuration. It keeps the user in setup until a later phase defines how configuration is completed and the interview is made ready.

### AI action

AI is not required to enter the setup state or manage deterministic configuration navigation. AI does not select values on the user's behalf, start the interview, validate the final configuration, or control application lifecycle at this stage. Any later approved interview intelligence remains within the configured interview scope.

### State change

The potential interview moves from Dashboard entry into Interview Setup / Configuration Begins. The state is configuration-in-progress, not Ready, Active Interview, Candidate Answer, or any later interview lifecycle state.

### Next state

- Configuration has been entered -> Remains in Interview Setup / Configuration until the next phase defines completion.
- User goes back or cancels -> Authenticated Dashboard
- Authentication becomes invalid -> Login / Account

### Errors / failure cases

- Setup information cannot be loaded: keep the user in a recoverable setup or return them to the Dashboard with an explanation and retry path.
- A temporary network or service problem occurs: do not discard completed history or progress; allow retry or safe return to the Dashboard.
- The user leaves before configuring the session: preserve no claim that an interview is active or completed.
- The setup state cannot be associated with the authenticated user or session: do not proceed as though a valid setup exists; explain the problem and provide safe return navigation.

### Exit / navigation

Back or cancel returns to the authenticated Dashboard. Leaving I-RIS before configuration completion exits the setup journey without entering Ready or Active Interview. The user can later re-enter setup from the Dashboard.

## Phase 1.2 Consistency Rules

- The journey advances the approved interview-practice workflow and does not add a new product capability.
- History and Progress remain limited to the capabilities approved in Phase 0.4 and documented in Phase 1.1.
- Start Interview enters setup only; it does not begin an interview, invoke interview questioning, or produce evaluation or feedback.
- Navigation, authentication checks, setup state, validation, persistence, and lifecycle control remain deterministic application responsibilities.
- AI is not the owner of Dashboard navigation or setup lifecycle control.
- First-time users receive a clear next action without fabricated history or progress data.
- Recoverable failures preserve completed information and provide retry, return, or safe exit paths.
- No technology, API, database, authentication implementation, UI, visual-design, infrastructure, or unrelated feature decision is introduced.

## Phase 1.3: Interview Configuration

### Purpose and Boundary

This phase continues from the Phase 1.2 Interview Setup / Configuration Begins state:

Interview Setup -> Interview Type -> Topic / Skill -> Difficulty -> Duration -> Language -> Mode -> Configuration Validation -> Configuration Accepted -> Ready Screen

Phase 1.3 ends at the transition:

Valid Interview Configuration -> Ready Screen

The Ready Screen is acknowledged as the next state, but its detailed behavior belongs to Phase 1.4. This phase does not define the actual interview start, first question, candidate answer, answer analysis, follow-up questions, active-interview timer behavior, interview completion, closing conversation, expected score, or final evaluation.

### Configuration Entry

#### User sees

The user understands that they are preparing a new mock interview and must provide the approved configuration before the interview can become ready. The configuration determines what kind of interview will be practiced, what the user wants to practice, the challenge level, the time boundary, the interaction language, and the interaction mode.

The user can understand that configuration is preparation for an interview, not the active interview itself. No interview question is presented at this stage.

#### User action

The user reviews and provides one valid choice or value for each approved configuration dimension. The user may move through the configuration conceptually in the documented order or revise an earlier choice before accepting the complete configuration.

#### System action

The system presents the configuration state, retains the relationship to the authenticated user or session, records the user's current selections, and makes the configuration ready for conceptual validation. It does not start the interview before the configuration is accepted.

#### AI action

AI is not required for deterministic configuration navigation, recording selections, validating required configuration, or controlling the transition to the Ready Screen. AI does not choose values on the user's behalf or start the interview at this stage.

#### State change

The potential interview moves from configuration-in-progress toward a complete configuration containing all six approved dimensions. It remains outside the Ready, Active Interview, Candidate Answer, and later interview states until validation and acceptance succeed.

#### Validation

Conceptually, the configuration is acceptable when:

- Interview Type is present and is one of the approved MVP types.
- Topic / Skill is present and identifies what the user wants to practice.
- Difficulty is present and is one of the approved levels.
- Duration is present and valid as the configured interview time boundary.
- Language is present and is one of the supported language choices.
- Mode is present and is one of the approved modes.

The system must not accept an incomplete, invalid, or unsupported configuration as ready. Detailed validation rules and implementation behavior are outside this phase.

#### Next state

- All six dimensions are valid -> Configuration Validation -> Configuration Accepted -> Ready Screen
- A required or invalid value remains -> Configuration continues with an understandable correction path
- User goes back or cancels -> Authenticated Dashboard

#### Errors / failure cases

- A required configuration value is missing: identify that the configuration is incomplete and allow the user to provide or revise it.
- A selected value is invalid or unsupported: explain that it cannot be accepted and provide a correction path.
- The duration is missing or invalid: keep the configuration unaccepted and allow the user to choose a valid duration.
- The selected language is not supported: keep the configuration unaccepted and allow the user to choose Hinglish, English, or Hindi.
- A temporary failure occurs while preparing validation or the next state: preserve available selections where possible, provide retry or safe return navigation, and do not claim that the configuration was accepted.
- The user attempts to continue with incomplete configuration: keep the user in configuration and explain what remains required.

Configuration failures must not erase completed interview history or progress and must not create an active interview.

#### Exit / navigation

The user may go back or cancel configuration to return to the authenticated Dashboard. Navigating away before acceptance does not mean that an interview is ready, active, or completed. This phase does not assume draft-saving behavior. The user may later start a new configuration from the Dashboard.

## Configuration Dimensions

### Interview Type

#### User sees and understands

The user understands that Interview Type determines the broad kind of interview practice they are preparing for.

The approved MVP interview types are:

- **Technical Interview:** Practice technical concepts, explanations, and technical interview discussion.
- **HR Interview:** Practice HR-oriented interview conversation and responses.
- **Mixed Interview:** Practice a combination of technical and HR-oriented interview areas.

No additional interview types are included in the MVP configuration. The detailed interview behavior for each type belongs to a later AI behavior/specification phase.

#### User action and system action

The user selects one approved interview type. The system records the choice as part of the configuration and keeps it available for validation and the later Ready Screen. AI is not required to record or validate this deterministic selection.

#### State and failure behavior

The configuration gains an Interview Type value. If no type is selected or an unsupported type is presented, the configuration remains incomplete or invalid and the user can correct it.

### Topic / Skill

#### User sees and understands

The user understands that Topic / Skill identifies the subject or capability they want to practice within the selected interview type. Examples may include Java, JavaScript, Python, DBMS, Operating Systems, or Web Development. These examples clarify the concept and are not an exhaustive final category list.

#### User action and system action

The user identifies a topic or skill for practice. The system records that focus as part of the configuration and makes it available for validation. Topic/category management and data structures are outside this phase. AI is not required to record or validate the deterministic configuration value.

#### State and failure behavior

The configuration gains a Topic / Skill value. If the user has not identified a practice focus, the configuration remains incomplete and the user receives an understandable path to provide or revise one.

### Difficulty

#### User sees and understands

The user understands that Difficulty expresses the intended challenge level of the interview from the user's perspective.

The approved MVP difficulty levels are:

- **Easy:** Foundational or introductory practice.
- **Medium:** Standard interview-level practice.
- **Hard:** More challenging interview-level practice.

Selecting a difficulty does not define the technical algorithm used to adapt questions.

#### User action and system action

The user selects Easy, Medium, or Hard. The system records the selected level as part of the configuration and validates that it is an approved choice. AI is not required for this deterministic selection.

#### State and failure behavior

The configuration gains a Difficulty value. If no difficulty is selected or an unsupported level is used, the configuration remains invalid and the user can correct it.

### Duration

#### User sees and understands

The user understands that Duration sets the configured interview time boundary. The selected duration determines the primary automatic completion boundary for the later interview, consistent with the approved project scope.

#### User action and system action

The user selects or provides an approved valid duration. The system records it as part of the configuration and validates that it can serve as the interview time boundary. AI is not required for this deterministic configuration behavior.

#### State and failure behavior

The configuration gains a Duration value. If the duration is missing or invalid, the system does not accept the configuration and gives the user a clear correction path. This phase does not define timers or timing mechanisms.

### Language

#### User sees and understands

Language is a core interview-experience preference, not merely a translation option. The approved MVP language priority is:

1. **Hinglish - Primary / Default**
2. **English - Supported**
3. **Hindi - Supported**

Hinglish is the primary and default I-RIS experience because natural conversational Hinglish is a core differentiator for Indian students and freshers. It means natural mixed-language communication rather than literal word-for-word translation. The intended direction is a professional interview tone that can still feel natural and comfortable in Indian conversational use.

The user may intentionally choose English or Hindi instead of the Hinglish default. The selected language becomes part of the interview configuration and should remain consistent with the user's preference unless a later approved adaptive behavior defines otherwise. Hinglish is not an English-proficiency measure.

Detailed natural Hinglish behavior, prompts, models, and implementation belong to a later AI behavior/specification phase.

#### User action and system action

The user accepts the default Hinglish preference or intentionally selects English or Hindi. The system records the selected language as part of the configuration and validates that it is supported. AI is not required to record or validate the selection during configuration.

#### State and failure behavior

The configuration gains a Language value. If the language is missing or unsupported, the configuration remains invalid and the user can choose Hinglish, English, or Hindi. The system must not silently replace an intentional supported language choice with another language.

### Mode

#### User sees and understands

The user understands that Mode determines how the interview interaction is intended to be conducted.

The approved MVP modes are:

- **Text:** The interview interaction is conducted through text.
- **Voice:** The interview interaction is intended to use voice as part of the approved controlled voice experience.

No video, webcam, emotion detection, or other mode is introduced.

#### User action and system action

The user selects Text or Voice. The system records the selected mode as part of the configuration and validates that it is an approved choice. AI is not required to record or validate this deterministic selection. Voice processing details are outside this phase.

#### State and failure behavior

The configuration gains a Mode value. If no mode is selected or an unsupported mode is used, the configuration remains invalid and the user can correct it.

## Configuration Validation and Acceptance

### User sees

The user understands whether the six required configuration dimensions are complete and valid. The user has a clear opportunity to correct missing or invalid choices before the configuration is accepted.

### User action

The user reviews the configuration and attempts to continue when all required values have been provided. If validation identifies a problem, the user revises the relevant configuration value.

### System action

The system checks the configuration conceptually against the approved dimensions and supported values. If valid, it accepts the configuration and transitions toward the Ready Screen. If invalid, it keeps the user in configuration and explains what must be corrected.

### AI action

AI is not required for configuration validation or acceptance. AI must not override missing values, invent a selection, or mark an invalid configuration as accepted.

### State change

- Incomplete or invalid configuration -> Configuration remains in progress
- Valid configuration -> Configuration Accepted

Configuration Accepted means that the system has a valid set of Interview Type, Topic / Skill, Difficulty, Duration, Language, and Mode values. It does not mean that the active interview has started.

### Next state

Configuration Accepted -> Ready Screen

The Ready Screen is the endpoint of Phase 1.3. Its detailed user experience and the actual interview start flow are deferred to Phase 1.4.

### Errors / failure cases

- Validation identifies missing information: keep the user in configuration and identify the required correction.
- Validation identifies an unsupported selection: keep the user in configuration and allow a supported replacement.
- A temporary failure prevents acceptance: preserve the user's completed selections where possible and provide retry or safe return navigation.
- The user abandons configuration: return to the Dashboard without claiming that the configuration was accepted.

### Exit / navigation

Before acceptance, back or cancel returns to the authenticated Dashboard. After Configuration Accepted, the journey proceeds to the Ready Screen; the user does not enter the active interview as part of Phase 1.3.

## Configuration Summary

Before entering the Ready Screen, the system has a valid conceptual configuration containing:

- Interview Type
- Topic / Skill
- Difficulty
- Duration
- Language
- Mode

The user has a clear understanding of what interview they are about to prepare for. The summary is a product-behavior expectation only; this phase does not define its visual presentation or controls.

## Phase 1.3 Consistency Rules

- Configuration remains within the approved interview-practice scope from Phases 0.3 and 0.4.
- Technical Interview, HR Interview, and Mixed Interview are the only approved MVP interview types in this journey.
- Hinglish is the primary/default language experience; English and Hindi are supported alternatives.
- The selected duration remains the primary automatic interview completion boundary for the later active interview.
- First-time users receive understandable configuration guidance without requiring developer assistance, consistent with Phase 0.5.
- Navigation, validation, configuration state, persistence, and lifecycle control remain deterministic application responsibilities under Phase 0.6.
- AI is not responsible for deterministic configuration navigation or acceptance and does not start the interview in this phase.
- Recoverable failures preserve completed history, progress, and available configuration information where possible.
- No technology, API, database, authentication, voice-processing, UI, visual-design, infrastructure, prompt, model, or provider decision is introduced.

## Phase 1.4: Ready Screen to Active Interview / First Question

### Purpose and Boundary

This phase continues from the valid configuration produced by Phase 1.3:

Ready Screen -> Candidate Starts Interview -> Interview Initialization -> Active Interview -> AI Opening -> First Interview Question Presented

Phase 1.4 ends exactly when the first interview question is presented. It does not define candidate answer processing, answer analysis, scoring, follow-up questions, adaptive difficulty, next-question selection, interview completion, closing conversation, expected score, final evaluation, feedback, or results.

### Stage 1: Ready Screen

#### User sees

The candidate understands that a valid interview configuration is ready and knows what interview is about to begin. The conceptual configuration includes:

- Interview Type
- Topic / Skill
- Difficulty
- Duration
- Language
- Mode

The candidate understands that confirming the start will move the session into an active interview. The Ready Screen does not present the first question before the candidate starts.

#### User action

The candidate reviews the configured interview and chooses to start it. The candidate may decide not to start, go back to configuration, or leave the Ready Screen.

#### System action

The system presents the valid configuration as ready for a start decision and keeps the session outside the Active Interview state until the candidate confirms. It does not start the interview from merely displaying the Ready Screen.

#### AI action

AI is not required to display the Ready Screen, present the configuration, or control the start decision. AI must not independently change the application from Ready to Active Interview.

#### State change

The session remains in the Ready state until the candidate confirms the start. A back, cancel, or leave action returns the journey to the appropriate earlier state without starting the interview.

#### Next state

- Candidate confirms start -> Interview Initialization
- Candidate goes back -> Interview Setup / Configuration
- Candidate cancels or leaves -> Authenticated Dashboard or a safe earlier state

#### Errors / failure cases

- The valid configuration is unavailable: do not start the interview; provide a recoverable return or retry path.
- The authenticated session is no longer valid: route to Login / Account without entering Active Interview.
- A temporary service problem occurs before start: keep the candidate outside Active Interview and allow retry or safe exit.

#### Exit / navigation

Going back returns to Interview Setup / Configuration. Cancelling or leaving before confirmation does not create an active interview, candidate answer, evaluation, or result. Draft-saving or resume-session behavior is not defined in this phase.

### Stage 2: Candidate Starts Interview

#### User sees

The candidate understands that the start action is being processed and that the interview will become active only after the system successfully initializes the configured session.

#### User action

The candidate confirms the decision to start the interview from the Ready Screen.

#### System action

The system accepts the candidate's explicit start action, checks that the valid configuration and authenticated session are still available, and begins interview initialization. The system, not the AI, controls the transition into the Active Interview lifecycle state.

#### AI action

AI is not responsible for accepting the start action or changing the application lifecycle state. AI becomes involved only after the system has established the Active Interview state and requests the opening interaction.

#### State change

Ready -> Interview Initialization

The session is in the process of becoming active but is not treated as Active Interview until initialization succeeds.

#### Next state

- Initialization succeeds -> Active Interview
- Initialization fails recoverably -> Ready Screen or a safe retry state
- Authentication becomes invalid -> Login / Account

#### Errors / failure cases

- The start action cannot be processed: explain that the interview did not start and provide retry or return navigation.
- The selected configuration is no longer available: preserve the candidate's valid information where possible and return to configuration or Ready for correction.
- A temporary service interruption occurs: keep the candidate outside the active lifecycle until initialization succeeds.

#### Exit / navigation

Before initialization succeeds, the candidate may cancel or leave and return safely to the Ready Screen, configuration, Dashboard, or account access as appropriate. The system must not represent an unsuccessful start attempt as an active interview.

### Stage 3: Interview Initialization

#### User sees

The candidate understands that I-RIS is preparing the configured interview session and will proceed to the interviewer opening when preparation succeeds.

#### User action

The candidate waits for initialization to complete. No additional interview answer action is required at this stage.

#### System action

At a product-behavior level, the system establishes that:

- The selected Interview Type, Topic / Skill, Difficulty, Duration, Language, and Mode are available.
- The interview session is active.
- The configured Duration is associated with the interview as the primary automatic completion boundary.
- The candidate is now in the Active Interview state.
- The interview can proceed to its first interaction.

The system controls interview state, start/stop lifecycle, duration boundary association, navigation, session state, and completion rules. This phase does not define timers, APIs, database structures, or other implementation mechanisms.

#### AI action

AI does not initialize the application session or decide that the interview has started. After the system establishes Active Interview, AI provides the conversational interviewer opening and prepares the first question within the approved configuration.

#### State change

Interview Initialization -> Active Interview

The interview is now active, but the candidate has not yet answered a question.

#### Next state

- Initialization succeeds -> AI Interviewer Opening
- Initialization fails recoverably -> Ready Screen or safe retry/recovery state

#### Errors / failure cases

- Initialization fails: keep the candidate outside or safely recoverable from Active Interview and explain that the interview could not start.
- Configuration data becomes unavailable: preserve valid user information where possible and provide correction or retry navigation.
- A temporary service failure occurs: allow retry without unnecessarily forcing the candidate to repeat all earlier configuration.
- The selected Voice mode cannot initialize: explain that the selected mode is temporarily unavailable and provide a recoverable path without silently changing the selected mode.

Recoverable initialization failures must not unnecessarily destroy valid configuration, completed history, or progress.

#### Exit / navigation

If initialization has not succeeded, the candidate may return to Ready or configuration. Once Active Interview has been established, leaving is an intentional early exit under the approved lifecycle rules; the complete early-termination and closing flow belongs to Phase 1.7.

### Stage 4: Active Interview and AI Opening

#### User sees

The candidate experiences the beginning of a professional, natural interview conversation appropriate to the selected Interview Type, Topic / Skill, Difficulty, Language, and Mode. The opening makes clear that the interview has begun and prepares the candidate for the first question.

The interviewer should feel like an I-RIS mock interviewer rather than a generic chatbot. The opening may acknowledge the configured interview context without exposing implementation details or making unsupported promises.

#### User action

The candidate listens to or reads the opening interaction and prepares to respond to the first interview question. No answer is processed as part of this phase.

#### System action

The system keeps the session in Active Interview, preserves the configured interview state, and controls the transition from initialization to the first presented question. It does not allow the AI to independently start, end, or bypass the application lifecycle.

#### AI action

AI provides the interviewer opening and conversational framing appropriate to the approved configuration. It should use a professional tone and respect the selected language preference:

- Hinglish is the primary/default experience and should be natural conversational Indian Hinglish, not stiff translated English.
- English is supported when selected.
- Hindi is supported when selected.

The opening should be appropriate to Technical, HR, or Mixed Interview and the selected Topic / Skill and Difficulty. Exact wording, prompts, models, providers, and production AI behavior are outside this phase.

#### State change

Active Interview -> AI Interviewer Opening -> First Question Preparation

The session remains active throughout. The candidate has not yet entered answer processing or evaluation.

#### Next state

AI Interviewer Opening -> First Interview Question Presented

#### Errors / failure cases

- The AI opening cannot be produced: keep the session recoverable, explain that the interviewer opening is temporarily unavailable, and provide retry or safe exit behavior.
- The opening is temporarily delayed: do not falsely present the interview as completed or move to a later lifecycle state.
- The opening does not match the selected configuration: do not silently redefine the configuration; provide a recoverable path for correction or retry.

#### Exit / navigation

The candidate may intentionally leave immediately after the interview becomes active or before answering the first question. This is treated as an intentional early exit under the approved lifecycle concept; detailed early termination, completion, closing, and feedback behavior are deferred to Phase 1.7.

### Stage 5: Mode Behavior

#### Text mode

The candidate receives the interviewer opening and first question through text and understands that the interview conversation is proceeding in the selected Text mode.

#### Voice mode

The candidate experiences the interviewer opening and first question through the approved Voice mode and understands that the interview conversation is proceeding in the selected Voice mode. Voice processing, speech-to-text, text-to-speech, providers, audio pipelines, APIs, and libraries are not defined here.

#### Responsibility boundary

Mode presentation remains controlled by the application according to the accepted configuration. AI provides the interviewer conversation but does not choose the mode, initialize voice infrastructure, or control the interview lifecycle.

### Stage 6: First Interview Question Presented

#### User sees

The candidate receives the first question and understands that the active interview has reached its first interview interaction. The question is presented in the selected Text or Voice mode and in the selected language experience.

#### User action

The candidate prepares to answer the first question. Answer submission and answer processing are outside Phase 1.4.

#### System action

The system confirms that the interview remains in Active Interview and that the first question has been presented within the configured session context. It does not yet evaluate the candidate's answer or move to a follow-up state.

#### AI action

AI provides a first question that is relevant to the selected Interview Type, Topic / Skill, Difficulty, and Language. The question should be a suitable opening question for the configured interview, but this phase does not define the detailed question-generation algorithm.

#### State change

Active Interview -> First Question Presented

The Phase 1.4 journey is complete at this state. No answer, analysis, scoring, follow-up, completion, closing, evaluation, or result has been defined here.

#### Next state

The next phase will define the candidate answer interaction. It is not defined in Phase 1.4.

#### Errors / failure cases

- The first question cannot be produced: preserve the Active Interview state as recoverable where possible and provide retry or safe early-exit behavior.
- The question does not match the accepted configuration: do not proceed as though the question is valid; provide correction or retry behavior.
- A temporary Text or Voice presentation problem occurs: preserve the active session information where possible and provide a recoverable path.

#### Exit / navigation

Before the candidate answers, an intentional exit follows the approved early-termination concept. The complete termination, completion, and closing behavior is deferred to Phase 1.7.

## Phase 1.4 Consistency Rules

- The journey remains focused on I-RIS as an AI-powered mock interview practice platform.
- Technical Interview, HR Interview, and Mixed Interview remain the approved MVP interview types.
- Text and Voice remain the only approved modes.
- Hinglish remains the primary/default language experience; English and Hindi remain supported alternatives.
- The configured duration remains associated with the Active Interview as the primary automatic completion boundary.
- The system controls interview state, start/stop lifecycle, navigation, session state, duration boundary, and completion rules.
- AI provides the interviewer opening and first question but cannot independently start or end the application interview.
- Recoverable failures preserve valid configuration, completed history, progress, and session information where possible.
- No answer processing, analysis, scoring, follow-ups, adaptive difficulty, completion, closing, expected score, evaluation, feedback, or results behavior is defined.
- No technology, API, database, voice implementation, prompt, model, provider, UI, visual-design, or infrastructure decision is introduced.

## Phase 1.5: Question -> Candidate Answer -> Answer Analysis

### Purpose and Boundary

This phase continues from the Phase 1.4 endpoint:

First Interview Question Presented -> Candidate Understands Question -> Candidate Provides Answer -> Answer Received -> Answer Analyzed -> Analysis Completed -> Interview Decision / Next-Question State

Phase 1.5 ends at **Answer Analysis Completed -> Interview Decision / Next-Question State**. It defines the question, answer, receipt, and analysis journey only. It does not define the actual follow-up strategy, adaptive difficulty, next-question rules, interview completion, closing conversation, expected score, final evaluation, final feedback, or results.

### System and AI Responsibility Boundary

The system controls the answer state, submission or answer-completion state, session state, interview lifecycle, navigation, and deterministic application behavior.

AI controls understanding and analysis of the candidate's response, including identifying correctness, relevance, completeness, missing points, reasoning, explanation quality, and improvement opportunities. AI produces structured analysis as an input to later interview behavior. AI must not independently terminate the interview or decide that the application should end.

## Stage 1: Question Presentation

### User sees

The candidate sees or hears the current interview question and understands what they are expected to answer. The question is presented within the active interview and remains connected to the accepted Interview Type, Topic / Skill, Difficulty, Language, and Mode.

The candidate understands that the current step is to provide an answer, not to receive a final evaluation or result.

### User action

The candidate reads or listens to the question, considers it, and prepares a response.

### System action

The system maintains the current question state, keeps the interview session active, and makes the question available for the candidate's response. It controls navigation and session state while the candidate is preparing to answer.

### AI action

AI is responsible for providing a question that is relevant to the accepted interview configuration and understandable in the selected language experience. It may conduct the question interaction conversationally, but the detailed question-generation algorithm is outside this phase.

### State change

First Question Presented -> Candidate Answer Expected

The session remains in Active Interview and moves into the candidate-answer state.

### Next state

Candidate Answer Expected -> Candidate Provides Answer

### Errors / failure cases

- The question fails to appear or be heard: preserve the active session where possible and provide a retry or safe recovery path.
- The question content is temporarily unavailable: do not treat the candidate as having answered; allow the question interaction to recover.
- A temporary AI or service failure occurs: preserve valid session information and avoid unnecessarily forcing the candidate to restart the interview.
- The question does not match the accepted configuration: do not proceed as though it is valid; provide a correction or recovery path.

### Exit / navigation

The candidate may intentionally leave before answering. This follows the approved early-termination concept, while the complete termination, completion, and closing behavior remains outside Phase 1.5.

## Stage 2: Candidate Provides Answer

### User sees

The candidate understands that the current question is awaiting a response and that the response will be received for analysis before the interview proceeds to a later decision state.

### User action

The candidate provides an answer in the selected mode:

- **Text:** The candidate writes and submits a written response.
- **Voice:** The candidate provides a spoken response through the approved Voice mode.

The candidate may complete the response according to the interaction expectations of the selected mode. Voice processing and transcription behavior are not defined here.

### System action

The system maintains the candidate-answer state, associates the response with the current question and active interview session, and controls when the answer is submitted or considered complete. It does not analyze the answer as a deterministic application decision.

### AI action

AI is not required to control the candidate's answer state or submission. AI may later interpret the received response for analysis, but it does not decide that the candidate's application session has ended.

### State change

Candidate Answer Expected -> Candidate Answer Submitted / Completed

The response is ready to be received, subject to conceptual checks for emptiness or sufficient completion.

### Next state

- A usable answer is submitted or completed -> Answer Received
- The answer is empty or incomplete -> Candidate Provides Answer or a recoverable correction state
- The candidate intentionally exits -> Approved early-exit path outside the detailed Phase 1.5 analysis flow

### Errors / failure cases

- The candidate submits an empty response: explain that an answer is required and allow the candidate to provide or retry the response before analysis begins.
- The response is incomplete: allow the candidate to complete or revise it where the selected interaction supports that behavior; do not treat an obviously incomplete response as complete without an understandable state transition.
- The answer cannot be submitted or completed: preserve the active question and provide a retry or safe recovery path.
- A temporary Text or Voice service problem occurs: preserve valid session information and avoid unnecessarily discarding the candidate's response.

### Exit / navigation

Before the answer is received, the candidate may leave intentionally under the approved early-termination concept. The system must not silently convert an abandoned or failed answer into an analyzed answer.

## Stage 3: Answer Received

### User sees

The candidate understands that the response has been received and that I-RIS is preparing to analyze how well it answers the current question. The candidate is not shown a final score or final interview result at this stage.

### User action

The candidate waits for the response to be processed into the analysis stage. If the system identifies that the answer was empty or not sufficiently complete to receive, the candidate may correct or retry it before analysis proceeds.

### System action

The system considers an answer received when a response associated with the current question has been submitted or completed sufficiently for analysis, according to the selected Text or Voice interaction. It preserves the question-response relationship and moves the session to answer analysis without changing the interview's lifecycle state.

The system may keep an answer as incomplete or unreceived when it cannot be interpreted as a usable response. It must not claim successful receipt when the response was lost or never completed.

### AI action

AI does not decide whether the application has received or completed an answer. After the system establishes Answer Received, AI analyzes the response in relation to the current question and selected interview context.

### State change

Candidate Answer Submitted / Completed -> Answer Received -> Answer Analysis In Progress

The interview remains active and no follow-up or next-question decision is made yet.

### Next state

- Answer is usable -> Answer Analysis In Progress
- Answer is empty, incomplete, or not received -> Candidate Provides Answer or recoverable correction state
- Analysis service is unavailable -> Recoverable Analysis Failure state

### Errors / failure cases

- The answer is empty: keep it unreceived and allow the candidate to respond.
- The answer is incomplete or unclear: preserve it as a candidate response where possible and allow correction or proceed only when it is conceptually usable for analysis.
- The answer cannot be received: preserve the active question and provide retry or safe recovery behavior.
- A service interruption occurs: do not unnecessarily destroy the question, response, or active session state.

### Exit / navigation

Once a usable answer has been received, the candidate normally waits for analysis. An intentional exit remains governed by the approved lifecycle rules; AI analysis does not independently terminate the application interview.

## Stage 4: AI Answer Analysis

### User sees

The candidate understands that I-RIS is evaluating the response's relationship to the current question for interview-practice purposes. The analysis is not presented as a hiring decision, placement prediction, perfect judgment, or scientifically validated measurement.

### User action

The candidate waits for analysis to complete. No new question is answered during this stage.

### System action

The system keeps the response associated with the active interview session, preserves the current lifecycle state, and waits for structured analysis to become available. It controls the transition into and out of analysis and does not allow analysis to independently end the interview.

### AI action

AI analyzes the candidate's response in relation to:

- The current interview question
- The selected Interview Type
- The selected Topic / Skill
- The selected Difficulty
- The selected Language
- The expected knowledge or response quality relevant to the question

The analysis considers:

- **Technical correctness:** Whether the substantive answer is correct or contains incorrect claims.
- **Relevance:** Whether the response addresses the question asked.
- **Completeness:** Whether the response covers the important aspects expected for the question.
- **Explanation quality:** Whether the candidate explains the idea clearly enough for an interview conversation.
- **Reasoning:** Whether the response demonstrates understandable reasoning or justification where relevant.
- **Missing important points:** What relevant information or distinctions were not included.
- **Improvement opportunities:** What the candidate could clarify, add, correct, or practice.

AI should understand the selected language experience. Natural mixed Hindi-English communication in Hinglish is valid and should not be treated as incorrect merely because its grammar is not formal English. The candidate should be assessed primarily on relevance, correctness, completeness, reasoning, and explanation quality, not on English fluency alone.

AI analysis is not assumed to be perfectly accurate and does not produce a final interview score, hiring decision, rejection decision, or placement decision.

### State change

Answer Analysis In Progress -> Answer Analysis Completed

### Next state

Answer Analysis Completed -> Interview Decision / Next-Question State

The actual rules for follow-ups, adaptive behavior, and next-question selection belong to Phase 1.6.

### Errors / failure cases

- Analysis is temporarily unavailable: preserve the received response and active session information, then provide a recoverable retry or safe handling path.
- Analysis fails: do not discard the response or falsely claim that analysis completed.
- The answer is not interpretable: identify that analysis is inconclusive and preserve the response for an appropriate later decision; do not invent certainty.
- A service interruption occurs: preserve valid session and answer information where possible and allow recovery.
- The answer was lost or incomplete: return to a recoverable answer state where appropriate rather than silently analyzing missing content.

### Exit / navigation

Analysis does not create a new user navigation destination or end the interview. The system retains lifecycle control. An intentional candidate exit follows the approved early-termination concept, while detailed completion and closing behavior remain outside this phase.

## Stage 5: Conceptual Answer-Quality Categories

These categories describe behavioral interpretation only. They are not numerical scores, weighted formulas, final evaluations, or hiring decisions.

- **Strong answer:** Relevant, correct, sufficiently complete, and well explained for the current question.
- **Partial answer:** Shows some correct understanding but omits important elements or needs more explanation.
- **Weak answer:** Shows limited understanding, incorrect reasoning, or an insufficient response.
- **Irrelevant answer:** Does not meaningfully address the current question.
- **Unclear answer:** Is too ambiguous or incomplete to assess confidently.

The category and analysis should reflect the relationship between the question and the candidate's response. It should not treat imperfect English grammar or natural Hinglish as automatic evidence of a weak technical answer.

## Stage 6: Structured Analysis Output

When analysis is completed, the conceptual output is structured enough to support the later Interview Decision / Next-Question State. It identifies:

- What the candidate did well
- What was incorrect or weak
- What important points were missing
- How strong the reasoning and explanation were
- What could be improved
- Whether the response was strong, partial, weak, irrelevant, or unclear in relation to the question

This is an intermediate analysis output, not the final Feedback/Results experience. No numerical scoring formula is defined here.

## Phase 1.5 Consistency Rules

- The journey remains focused on realistic AI-powered interview practice and meaningful response feedback.
- Hinglish remains the primary/default language experience; English and Hindi remain supported alternatives.
- Text and Voice remain the approved interaction modes.
- Technical Interview, HR Interview, and Mixed Interview remain the approved MVP interview types.
- The system controls answer state, submission/completion state, session state, navigation, and interview lifecycle.
- AI analyzes the answer and produces structured analysis but cannot independently terminate the interview or end the application.
- Analysis remains relevant to the current question and does not claim perfect accuracy or scientifically validated assessment.
- No final score, hiring decision, placement decision, final evaluation, final feedback, or results are produced in this phase.
- Follow-up strategy, adaptive behavior, and next-question rules are deferred to Phase 1.6.
- Recoverable failures preserve valid question, answer, configuration, history, progress, and session information where possible.
- No technology, API, database, voice-processing, prompt, model, provider, UI, visual-design, or infrastructure decision is introduced.

## Phase 1.6: Follow-up / Adaptive Interview

### Purpose and Boundary

This phase continues from the completed answer analysis:

Answer Analysis Completed -> Follow-up Decision -> Contextual Follow-up or Next Planned Question -> Interview Decision / Next-Question State

Phase 1.6 defines how the analyzed response informs the next appropriate interview action at a product-behavior level. It ends when the system has decided the appropriate next interview action or state. It does not define final evaluation, final score calculation, expected-score conversation, closing conversation, history implementation, database schema, API contracts, UI, backend implementation, technology, or AI model/provider selection.

### System and AI Responsibility Boundary

The interview engine or application system controls the interview lifecycle, session state, configured duration boundary, navigation, completion conditions, and whether the interview may continue. It ensures that AI suggestions remain within the accepted interview configuration and does not allow an AI response to independently terminate the application interview.

AI assists with interpreting the completed answer analysis and suggesting the most appropriate conversational direction, such as a contextual follow-up, a move to the next planned topic, or a controlled difficulty adjustment. AI may decide the conversational content within the approved scope, but it does not own unrestricted lifecycle control.

There is no numerical answer threshold or approved scoring formula in this phase. The conceptual answer-quality categories guide behavior without becoming a numerical algorithm.

## Stage 1: Follow-up Decision

### User sees

The candidate experiences a continuing interview conversation. The candidate may receive a relevant follow-up, a transition to the next planned question or topic, or an appropriate adjustment in challenge. The candidate is not shown internal decision logic or a final performance score.

### User action

The candidate waits for the interviewer to continue and then prepares for the next interaction. The candidate does not choose the internal follow-up decision directly.

### System action

The system receives the completed analysis, confirms that the interview may continue within the configured session scope, and coordinates the next interview state. It ensures that the next action respects the configured Interview Type, Topic / Skill, Difficulty, Language, Mode, and duration boundary.

The system may use the AI's contextual suggestion as an input, but deterministic lifecycle control remains with the interview engine. The system does not let AI continue indefinitely or terminate the interview independently.

### AI action

AI considers the current question, candidate answer, structured analysis, and interview context to suggest whether the next interaction should be a contextual follow-up or a move to the next planned question or topic. AI may also suggest a controlled difficulty or topic-direction adjustment when relevant.

AI must keep the suggestion relevant to the interview objective and must not introduce unrelated subjects, unauthorized features, or unrestricted changes to the session.

### State change

Answer Analysis Completed -> Interview Decision / Next-Question State

The answer has been analyzed, but the next interaction has not yet been presented.

### Next state

- Contextual follow-up is appropriate -> Follow-up Question Preparation
- Next planned question or topic is appropriate -> Next Question Preparation
- Controlled difficulty or topic adjustment is appropriate -> Adjusted Next Question Preparation
- A configured lifecycle boundary has been reached -> The system follows the approved completion path; detailed completion behavior is outside Phase 1.6

### Errors / failure cases

- The analysis is unavailable or inconclusive: preserve the answer and context, use a recoverable decision path, and do not invent certainty.
- A follow-up cannot be generated appropriately: move to a relevant planned question or preserve the interview for safe recovery rather than asking an unrelated question.
- The context needed for a decision is unavailable: preserve the current session information and provide a recoverable path; do not silently discard the prior question or answer.
- The configured duration boundary or another deterministic completion condition is reached: the system retains lifecycle authority and follows the approved completion rules rather than allowing AI to decide independently.

### Exit / navigation

The candidate may intentionally end the interview through the approved End Interview flow. Phase 1.6 does not define the complete early-termination, closing, expected-score, evaluation, or feedback sequence.

## Stage 2: Contextual Follow-up Decision

### When a follow-up may be appropriate

A contextual follow-up may be appropriate when the response:

- Is partial and important information is missing.
- Is unclear and a clarification would help understand the candidate's reasoning.
- Shows a strong understanding that reasonably supports deeper exploration.
- Contains reasoning or an example that can be examined further.
- Includes a relevant claim that needs clarification within the current topic.

A follow-up is not required after every answer. The decision should consider whether the follow-up helps the approved interview objective and whether the current topic has meaningful ground to explore.

### Conceptual effect of answer-quality categories

- **Strong:** May justify a deeper or more challenging question related to the current topic, when appropriate.
- **Partial:** May justify a focused follow-up that explores or clarifies the missing important point.
- **Weak:** May justify a foundational clarification or a simpler question that remains within the configured topic and interview scope.
- **Irrelevant:** May justify a brief redirection toward the current question or topic before moving on; it must not reward irrelevance with an unrelated conversation.
- **Unclear:** May justify a clarification request when that can reasonably recover the candidate's intended answer.

These are conceptual relationships, not mandatory one-to-one rules. No category creates a numerical threshold or independently determines interview termination.

### User sees

The candidate experiences a follow-up that feels connected to the prior question and response. The candidate should understand why the interviewer is continuing that line of discussion, even when the wording varies naturally.

### User action

The candidate listens to or reads the contextual follow-up and prepares another answer in the selected mode and language.

### System action

The system confirms that the follow-up remains within the accepted Interview Type, Topic / Skill, Difficulty scope, Language, Mode, and active session. It advances the session only after the follow-up decision is valid for the current interview state.

### AI action

AI generates or selects a follow-up that directly relates to the previous question, answer, or identified analysis point. It should clarify, deepen, test reasoning, or explore a relevant omission rather than change topics without a meaningful connection.

AI should maintain context and avoid repeating the same question or asking a sequence of indistinguishable follow-ups. If a useful contextual follow-up cannot be formed, AI should support moving to the next relevant planned question instead of inventing an unrelated one.

### State change

Interview Decision / Next-Question State -> Follow-up Question Preparation

The interview remains active and the follow-up becomes the next intended interaction.

### Next state

Follow-up Question Preparation -> Follow-up Question Presented

The detailed presentation and answer journey follows the already-defined Question -> Candidate Answer -> Answer Analysis pattern from Phase 1.5.

### Errors / failure cases

- A follow-up is unrelated to the prior exchange: do not present it as an accepted contextual follow-up; use correction, retry, or a relevant next-question path.
- A follow-up repeats the same point without purpose: avoid repeated questioning and move toward the next relevant interaction.
- A follow-up cannot be generated appropriately: preserve the analysis and choose a relevant planned-question path where available.
- Context is incomplete: do not invent prior details; preserve the available context and use a safe recovery or next relevant action.

### Exit / navigation

The candidate may use the approved End Interview flow before answering the follow-up. The follow-up itself does not create a completion, closing, score, or final-results state.

## Stage 3: Next Planned Question or Topic

### User sees

The candidate experiences a natural transition to the next relevant part of the interview when further exploration of the previous response is not necessary or useful. The conversation remains within the accepted interview configuration.

### User action

The candidate reads or listens to the next question and prepares to answer it.

### System action

The system permits progression to another relevant question or topic within the configured interview scope and preserves the active session and lifecycle state. It ensures that progression does not bypass deterministic completion or duration controls.

### AI action

AI suggests or provides the next relevant question or topic when a contextual follow-up is not the appropriate next action. It should use the accepted configuration and retained context rather than switching unpredictably to an unrelated subject.

### State change

Interview Decision / Next-Question State -> Next Question Preparation

If a controlled adjustment is appropriate, the state may be described as Adjusted Next Question Preparation. This is a conceptual state only and does not define an adaptation algorithm.

### Next state

Next Question Preparation -> Next Question Presented -> Candidate Answer Expected

The later question-answer-analysis cycle is governed by the approved journey pattern; its detailed next-question behavior is not expanded here.

### Errors / failure cases

- No relevant next question can be prepared: preserve the active session and use a recoverable path within the configured scope.
- The proposed question is outside the selected topic or interview type: do not present it as valid; correct or replace it.
- Progression would exceed a deterministic lifecycle boundary: the system controls the boundary and does not allow AI to continue without authorization.

### Exit / navigation

The candidate may intentionally end the interview through the approved End Interview flow. Phase 1.6 does not define the resulting closing or evaluation flow.

## Stage 4: Controlled Adaptive Behavior

### User sees

The candidate experiences an interview that responds meaningfully to performance without becoming unpredictable. A stronger response may lead to deeper exploration, while a weaker or incomplete response may lead to clarification or a more foundational question.

### User action

The candidate continues answering the next relevant interaction in the selected Text or Voice mode.

### System action

The system limits adaptation to the accepted Interview Type, Topic / Skill, configured Difficulty, Language, Mode, and available interview time. It remains responsible for session state, duration, navigation, and completion controls.

The system must prevent uncontrolled topic changes, indefinite questioning, and lifecycle changes that were not approved by the interview engine.

### AI action

AI may suggest a controlled adjustment based on the structured analysis, such as:

- Deeper exploration after a strong response.
- Clarification or foundational exploration after a weak or partial response.
- A focused question about a missing important point.
- A related topic direction when the current objective supports it.

AI may not freely redefine the interview type, abandon the selected topic, change the user's language or mode without an approved basis, or create unrelated interview behavior.

### State change

Interview Decision / Next-Question State -> Controlled Next Interaction Preparation

The interview remains in Active Interview. No numeric score or final evaluation is created by this adaptation decision.

### Next state

Controlled Next Interaction Preparation -> Follow-up Question Presented or Next Question Presented

The exact selection logic belongs to later approved behavior and is not specified numerically here.

### Errors / failure cases

- The adaptation would be unpredictable or outside scope: retain the current configured direction and use a safe relevant next question.
- The analysis is too uncertain to justify adaptation: avoid overreacting and continue with a suitable in-scope interaction.
- Repeated adaptation produces the same follow-up pattern: avoid unnecessary repetition and move to a relevant next question or safe recovery state.

### Exit / navigation

Adaptation never removes the candidate's ability to use the approved End Interview flow. AI adaptation cannot independently terminate the application interview.

## Stage 5: Context Continuity

The following information should conceptually remain available for the next interviewer decision:

- The accepted Interview Type.
- The configured Topic / Skill.
- The configured Difficulty and any approved conceptual adjustment direction.
- The configured Duration and active lifecycle boundary.
- The selected Language, including Hinglish as the primary/default experience when selected.
- The selected Mode: Text or Voice.
- The current question.
- The candidate's current answer.
- The structured answer analysis.
- The conceptual answer-quality category, when analysis can support one.
- Important points identified as present, missing, incorrect, or unclear.
- The reasoning and explanation observations relevant to the current exchange.
- Follow-up questions already asked in the current line of discussion, to reduce unnecessary repetition.
- The current interview state and whether the system still permits continuation.

This continuity supports a coherent conversation. It does not define a database schema, storage mechanism, or API contract.

## Stage 6: Text and Voice Behavior

### Text mode

The candidate receives follow-ups and next questions through text. The same contextual and adaptive decision principles apply: the content must remain relevant to the prior question, answer, analysis, and configured interview scope.

### Voice mode

The candidate receives follow-ups and next questions through the approved Voice mode. The same contextual and adaptive decision principles apply. A spoken interaction that is partially received or unclear must be handled as a recoverable answer condition rather than silently treated as a complete, clear response.

Voice recognition, transcription, audio processing, providers, APIs, libraries, and implementation details are outside this phase.

### Shared behavior

Text and Voice use the same conceptual follow-up, context-continuity, adaptation, and lifecycle rules. The interaction mode changes how the candidate experiences the question, not the approved responsibility boundary or interview objective.

## Stage 7: Hinglish Behavior

When Hinglish is selected, follow-ups and adaptive interviewer responses should use natural conversational Indian Hinglish rather than literal sentence-by-sentence translation or stiff textbook phrasing. The tone should remain professional and appropriate to the selected interview type and topic.

Natural Hinglish is valid communication. English grammar or fluency should not be treated as interview performance unless the configured interview specifically requires language ability. Analysis should continue to focus on technical correctness, relevance, completeness, explanation quality, reasoning, missing points, and improvement opportunities.

The detailed language prompts and AI implementation behavior are deferred to a later AI behavior/specification phase.

## Stage 8: Error and Edge-Case Handling

- **Unclear answer:** Preserve the analysis context and allow a clarification-oriented follow-up when appropriate, without assuming a definitive weakness.
- **Irrelevant answer:** Maintain the configured interview objective, redirect toward the relevant topic when appropriate, and do not allow the conversation to drift without purpose.
- **Empty or missing answer:** Keep the answer unreceived or recoverable and do not treat it as analyzed evidence of performance.
- **AI analysis unavailable:** Preserve the received answer and active session information, then use a recoverable retry or safe in-scope decision path.
- **Follow-up cannot be generated appropriately:** Move to a relevant planned question or preserve the session for safe recovery rather than asking an unrelated question.
- **Repeated follow-up risk:** Track the current conversational context conceptually and avoid asking the same or indistinguishable follow-up without a clear reason.
- **Context unavailable:** Do not invent prior question, answer, or analysis details; preserve available information and use a safe relevant path.
- **Voice answer partially received:** Treat the response as incomplete or unclear until it is sufficiently usable, and allow an appropriate recovery or clarification path.

In every case, recoverable problems should not unnecessarily destroy valid configuration, question, answer, analysis, completed history, progress, or active-session information.

## Phase 1.6 Completion State

Phase 1.6 ends when the system has decided the appropriate next interview action/state based on the completed answer analysis:

**Interview Decision / Next-Question State**

The decision may identify a contextual follow-up, a next planned question or topic, or a controlled in-scope adjustment. The actual follow-up generation, adaptive algorithm, next-question selection, and later completion behavior are not specified beyond these product-level boundaries.

## Phase 1.6 Consistency Rules

- Follow-up and adaptive behavior remains focused on realistic AI-powered interview practice.
- Strong, Partial, Weak, Irrelevant, and Unclear categories guide conceptual behavior without numerical thresholds or scoring formulas.
- Follow-ups remain connected to the previous question, answer, and analysis and must not become unrelated conversation.
- Text and Voice share the same contextual and adaptive principles.
- Hinglish remains the primary/default language experience when selected, with natural conversational Indian usage rather than literal translation.
- The system controls lifecycle, duration, navigation, session state, and completion; AI provides bounded conversational suggestions and content.
- AI cannot independently terminate the interview, redefine the product scope, or create unrestricted unpredictable behavior.
- No final score, final evaluation, expected-score conversation, closing, results, database, API, UI, or implementation decision is defined.
- Recoverable errors preserve valid information and provide an in-scope path to continue, retry, clarify, or safely exit.

## Phase 1.7: Interview Completion, Early Termination, and Closing Conversation

### Purpose and Boundary

This phase continues from the Active Interview and its ongoing follow-up or next-question states:

Active Interview -> Completion Condition Detected -> Graceful Wrap-up -> Closing Conversation -> Expected Score Capture -> Interview Completed

Phase 1.7 ends exactly at **Interview Completed**. The next phase will define Final Evaluation, Actual Score, Structured Feedback, and Results presentation. Those later stages are not defined here.

### System and AI Responsibility Boundary

The system or interview engine controls the configured duration, interview lifecycle, completion condition, termination state, transition to Closing Conversation, and transition to Interview Completed. It decides when the application may stop accepting normal interview questions and prevents duplicate or unauthorized completion transitions.

The AI interviewer conducts natural interviewer conversation, helps perform a graceful wrap-up after the system has determined that the interview should end, asks the expected-score question, acknowledges the candidate's response, and provides natural closing language.

AI must not independently terminate the interview, override the configured duration or completion rules, change the candidate's expected score, use the expected score as actual evaluation, or generate final evaluation or scoring logic in this phase.

## Stage 1: Completion Condition Detected

### User sees

The candidate understands that the interview has reached a condition where it should conclude. The candidate is informed naturally that the active question-and-answer portion is ending and that a short closing conversation will follow.

The candidate is not shown a final score or final evaluation during this transition.

### User action

The candidate may finish the current interaction when the duration boundary occurs during an active response. Otherwise, the candidate listens to the transition toward closing and participates in the closing conversation.

### System action

The system detects the applicable completion condition and controls the transition out of normal question progression. The primary automatic completion boundary is the configured interview duration. The system does not accept normal new interview questions after the completion condition has been reached, subject to graceful handling of an interaction already in progress.

### AI action

AI does not decide independently that the application has completed. After the system detects completion, AI may communicate naturally that the interview is concluding and help prepare the candidate for the closing conversation.

### State change

Active Interview -> Completion Condition Detected

### Next state

Completion Condition Detected -> Graceful Wrap-up

### Errors / failure cases

- A duplicate completion trigger occurs: the system treats the interview as one completion flow and does not start multiple closing conversations.
- The completion condition cannot be communicated immediately: preserve the valid interview state and provide a recoverable transition toward closing.
- Navigation occurs during detection: do not silently create a second completion or claim that the interview completed more than once.

### Exit / navigation

Once completion has been detected, the candidate cannot resume normal question progression in this phase. The system proceeds toward graceful wrap-up, subject to recoverable handling if the closing interaction is interrupted.

## Stage 2: Graceful Wrap-up

### User sees

The candidate understands that the current interview interaction is being concluded respectfully rather than being cut off without acknowledgement.

### User action

If the candidate is answering when the configured duration is reached, they are allowed to complete the current interaction appropriately. If the current interaction has just finished, the candidate proceeds toward closing without being given an unrelated new question.

### System action

The system allows an active question or answer interaction to finish gracefully when necessary. It then stops normal question progression and moves the interview toward Closing Conversation. The system does not define or implement a timer mechanism here.

### AI action

AI may provide a natural wrap-up statement after the system has authorized completion. The wording should remain professional, respectful, and appropriate to the selected Interview Type, Topic / Skill, Language, and Mode.

### State change

Completion Condition Detected -> Graceful Wrap-up -> Closing Conversation

### Next state

Graceful Wrap-up -> Closing Conversation

### Errors / failure cases

- Duration is reached during a candidate answer: preserve the response and allow the current interaction to finish appropriately before closing.
- Duration is reached immediately after an answer: do not begin an unnecessary new question; proceed toward closing.
- A temporary interruption occurs during wrap-up: preserve the completion state and provide a recoverable path into closing.
- The AI cannot produce a wrap-up statement: the system still retains lifecycle control and proceeds with a safe, professional closing path where possible.

### Exit / navigation

The candidate may leave during wrap-up, but leaving does not erase the detected completion condition. The system continues toward the approved closing and completed state through recoverable handling.

## Stage 3: Candidate Early Termination

### User sees

The candidate understands that they can request to end the active interview before the configured duration, but that the request requires explicit confirmation. An accidental navigation or ambiguous action is not treated as confirmed termination.

### User action

The candidate requests End Interview and then explicitly confirms the termination when asked. The candidate may cancel the confirmation, decline to confirm, or change their mind.

### System action

The system presents a conceptual confirmation step and keeps the interview active until explicit confirmation is received. After confirmation, the system stops normal interview progression, records that the interview is ending early, and transitions toward the appropriate closing behavior.

### AI action

AI does not decide whether the termination request is confirmed and cannot terminate the application on its own. After the system confirms early termination, AI may acknowledge the early ending professionally and participate in the closing conversation.

### State change

Active Interview -> End Interview Requested -> Confirmation -> Early Termination Confirmed -> Graceful Wrap-up

### Next state

- Candidate confirms -> Graceful Wrap-up -> Closing Conversation
- Candidate cancels or does not confirm -> Active Interview
- Candidate changes their mind before confirmation -> Active Interview

### Errors / failure cases

- The candidate cancels termination: keep the interview active and return to the current interview state.
- The candidate does not confirm: do not terminate the interview; preserve the active session.
- The candidate changes their mind: treat the request as cancelled unless explicit confirmation has already occurred.
- An accidental navigation occurs: do not treat it as confirmed termination.
- A temporary failure occurs while confirming termination: preserve the current state and provide a clear retry or return path without creating duplicate completion.

### Exit / navigation

Before confirmation, back, cancel, or ambiguous navigation leaves the interview active or returns to the current interview state. After explicit confirmation, the interview follows the early-termination closing path. The detailed later evaluation and feedback behavior is outside Phase 1.7.

## Stage 4: Closing Conversation

### User sees

The candidate experiences a short, professional closing conversation before the interview reaches Interview Completed. The candidate understands that the interview has ended or is ending and that the closing is separate from later evaluation and results.

### User action

The candidate listens to or reads the closing, provides an expected score or self-assessment when asked, and may clarify their expectation if necessary.

### System action

The system keeps the interview in its controlled closing state, ensures that normal new questions are not introduced, and manages the transition through expected-score capture to Interview Completed. It does not calculate the final score or perform final evaluation in this phase.

### AI action

AI conducts the natural interviewer conversation conceptually in this sequence:

1. Formally acknowledge that the interview has ended or is concluding.
2. Provide a natural closing statement.
3. Ask the candidate for their expected score or self-assessment.
4. Capture the candidate's expectation.
5. Acknowledge the expectation without judging or correcting it.
6. Thank the candidate.
7. Provide a final professional closing statement.

The exact wording may vary. Hinglish remains the primary/default experience, with English and Hindi supported. Hinglish should sound natural and conversational rather than like literal translation. The closing should remain professional without sounding robotic.

### State change

Graceful Wrap-up -> Closing Conversation -> Expected Score Capture

### Next state

Expected Score Capture -> Interview Completed

No final evaluation, score calculation, feedback, or results presentation occurs in this phase.

### Errors / failure cases

- The closing conversation is interrupted: preserve the completion and expected-score state where possible and provide a recoverable path to continue closing.
- The expected score is not provided: acknowledge that no self-assessment was provided and continue professionally toward Interview Completed.
- The expected-score response is unclear: ask for clarification when reasonable; if it remains unclear, preserve it as an unclear self-assessment and continue without inventing a value.
- The AI cannot continue the closing conversation: the system retains lifecycle control and uses a recoverable professional closing path where possible.
- A recoverable service failure occurs: preserve the valid interview completion state and avoid reopening normal question progression.

### Exit / navigation

The candidate should not be returned to normal interview questioning during closing. Navigation away during closing is handled as an interrupted completion flow; it must not create a second active interview or duplicate completion. Detailed recovery presentation is outside this phase.

## Stage 5: Expected Score / Self-Assessment

### User sees

The candidate understands that the expected score is a personal self-assessment of their interview performance, requested before the interview is marked completed.

### User action

The candidate provides an expected score or communicates that they do not wish to provide one. The candidate may express the expectation in the selected interview language and mode.

### System action

The system captures the candidate's expectation as separate self-assessment information and does not use it to determine whether the interview was successful or complete. The system allows completion even when no clear expected score is provided.

### AI action

AI asks for the expectation and acknowledges the response without judging it. AI must not change the candidate's stated expectation, infer a definitive value from an unclear response, or use it as actual evaluation.

### State change

Closing Conversation -> Expected Score Captured or Expected Score Not Provided -> Final Closing

### Next state

Final Closing -> Interview Completed

### Errors / failure cases

- No expected score is provided: record that the self-assessment was not provided and continue the closing.
- The response is unclear: preserve it as unclear or ask a reasonable clarification, without inventing a score.
- The candidate declines: acknowledge the choice respectfully and continue.
- The expected-score interaction is interrupted: preserve the closing state and continue through recoverable handling.

### Exit / navigation

The expected score does not provide a route back to normal interview questioning. Once the system has entered closing, it proceeds toward Interview Completed through the approved completion path.

## Stage 6: Interview Completed

### User sees

The candidate understands that the interview session itself is complete and that no further normal interview questions will be asked. The candidate is not shown the final evaluation or results as part of Phase 1.7.

### User action

The candidate waits for the later phase that will handle final evaluation and results. No additional interview response is required in this phase.

### System action

The system transitions the interview to Interview Completed, stops normal interview progression, prevents duplicate completion, and preserves the completed session state for the next approved phase. It does not perform final evaluation or present results here.

### AI action

AI has completed its closing-conversation role. It does not reopen the interview, calculate the final score, generate final evaluation, or determine the later results presentation.

### State change

Final Closing -> Interview Completed

This is the exact endpoint of Phase 1.7.

### Next state

Interview Completed -> Later Final Evaluation / Actual Score / Structured Feedback / Results phase

The later phase is acknowledged only; its behavior is not defined here.

### Errors / failure cases

- A duplicate completion request occurs: preserve one completed state and do not reopen normal questioning.
- Navigation occurs after completion: retain Interview Completed and do not create a second active session.
- A recoverable failure occurs while marking completion: preserve the valid completion context and provide a safe recovery path without restarting normal interview questioning.

### Exit / navigation

After Interview Completed, the candidate leaves the Phase 1.7 journey. Later navigation to evaluation, feedback, results, history, or progress belongs to later approved phases and is not defined here.

## Text and Voice Completion Behavior

### Text mode

In Text mode, the candidate reads the completion notice, closing conversation, expected-score request, acknowledgement, and final closing statement as text. The same completion state transitions and confirmation rules apply.

### Voice mode

In Voice mode, the candidate experiences the completion notice, closing conversation, expected-score request, acknowledgement, and final closing statement through the approved voice interaction. The same completion state transitions and confirmation rules apply.

Voice recognition, speech-to-text, text-to-speech, audio processing, providers, APIs, libraries, and technical voice architecture are not defined here.

### Shared behavior

Text and Voice follow the same conceptual completion, early-termination, closing, expected-score, and Interview Completed behavior. The mode changes how the candidate experiences the conversation, not who controls the lifecycle or how the expected score is treated.

## Hinglish Completion Behavior

When Hinglish is selected, completion notices and closing conversation should use natural conversational Indian Hinglish with a professional tone. The wording should not be a stiff or literal translation of English closing language. English and Hindi remain supported when selected.

Language choice does not change the completion boundary or the rule that expected score is only a self-assessment. Hinglish remains a comfort and natural-interaction choice, not a measure of English proficiency.

## Phase 1.7 Completion Rules and Edge Cases

- **Duration reached while answering:** Allow the current interaction to finish appropriately, then move toward graceful wrap-up without starting a normal new question.
- **Duration reached immediately after an answer:** Proceed toward closing rather than beginning an unnecessary next interaction.
- **Candidate requests early termination:** Require explicit confirmation before changing the interview to an early-termination path.
- **Candidate cancels early termination:** Keep the interview active and continue the approved interview journey.
- **Candidate does not confirm or changes their mind:** Do not terminate the interview.
- **Closing conversation interrupted:** Preserve the completion/closing context and provide recoverable continuation without reopening normal questioning.
- **Expected score not provided:** Acknowledge the absence of self-assessment and continue to Interview Completed.
- **Expected score unclear:** Clarify when reasonable or preserve it as unclear without inventing a value.
- **AI unable to continue closing:** Retain system lifecycle control and continue through a safe professional closing path where possible.
- **Voice interaction interrupted:** Preserve the completion and closing context and provide a recoverable path consistent with the selected mode.
- **Duplicate completion trigger:** Maintain one completion flow and one Interview Completed state.
- **Navigation away during completion:** Treat it as an interrupted completion flow; do not create duplicate or contradictory interview states.
- **Recoverable failure during closing:** Preserve valid interview and completion information and allow safe continuation or completion.

## Phase 1.7 Consistency Rules

- The configured interview duration remains the primary automatic completion boundary.
- An interaction active at the duration boundary is handled gracefully before closing.
- Candidate early termination requires explicit confirmation; accidental or ambiguous navigation is not confirmation.
- The system controls duration, lifecycle, completion, termination, and the transition to Interview Completed.
- AI conducts bounded natural interviewer conversation and assists with wrap-up and expected-score capture but cannot independently terminate the interview.
- Hinglish remains primary/default, with natural conversational use; English and Hindi remain supported.
- Text and Voice share the same conceptual completion behavior.
- The expected score remains a self-assessment and does not influence actual evaluation, score, feedback, or results.
- No final evaluation, actual score, scoring algorithm, feedback, results, history, progress analytics, resume interview, UI, API, database, technology, or implementation behavior is defined.

## Phase 1.8: Final Evaluation, Actual Score, Structured Feedback, and Results

### Purpose and Boundary

This phase continues from the Phase 1.7 endpoint:

Interview Completed -> Evaluation Initiation -> Interview Evidence / Answer Review -> Overall Evaluation -> Actual Score -> Structured Feedback -> Results Presentation -> Candidate Understands Results -> Phase 1.8 Complete

Phase 1.8 defines what the evaluation and results experience means at a product-behavior level. It ends after the candidate can understand the final interview results. It does not define History, Progress Analytics, Re-practice, Resume-based Interviews, scoring implementation, UI, APIs, database design, technology, or AI provider/model behavior.

### System and AI Responsibility Boundary

The system or interview engine controls the completed-interview state, transition into evaluation, evaluation lifecycle, preservation of completed interview evidence, results availability, and navigation boundaries.

AI or evaluation logic assists with interpreting interview evidence, evaluating answer quality conceptually, identifying strengths and weaknesses, identifying improvement areas, producing actionable feedback, producing an overall assessment, and expressing the evaluation understandably.

AI must not restart the interview, modify completed answers, independently change interview lifecycle state, make hiring decisions, use the expected score to manipulate the Actual Score, invent evidence, or override system lifecycle rules.

## Stage 1: Evaluation Initiation

### User sees

The candidate understands that the completed interview is now being evaluated separately from the live interview. The candidate is not returned to the active interview and is not asked another interview question.

### User action

The candidate waits for evaluation to begin and complete. No further interview response is required.

### System action

After Interview Completed, the interview engine transitions the completed session into an evaluation state. It confirms that evaluation occurs only after completion, preserves the completed conversation, and makes the collected interview evidence available for evaluation.

Evaluation does not restart or continue the interview and must not modify the completed interview conversation.

### AI action

AI may interpret the completed interview evidence after the system has entered evaluation. AI does not initiate completion, reopen the interview, or change the completed session state.

### State change

Interview Completed -> Evaluation Initiation -> Evaluation In Progress

### Next state

Evaluation In Progress -> Interview Evidence / Answer Review

### Errors / failure cases

- Evaluation cannot begin immediately: preserve Interview Completed and provide a recoverable evaluation state.
- The completed session cannot be prepared for evaluation: do not alter the interview or claim that evaluation has completed.
- A duplicate evaluation attempt occurs: preserve one evaluation lifecycle for the completed session and avoid conflicting results.
- An interruption occurs during initiation: preserve the completed interview state and allow evaluation to be resumed conceptually.

### Exit / navigation

Leaving during initiation does not reopen the interview or erase its completed state. The candidate may return to the evaluation/results journey through the approved lifecycle; detailed navigation implementation is outside this phase.

## Stage 2: Interview Evidence / Answer Review

### User sees

The candidate understands that the evaluation is based on what occurred during the completed interview, not on an unrelated or invented assessment.

### User action

The candidate waits for the evidence review to inform the overall evaluation.

### System action

The system preserves the relationship between the completed interview and its collected evidence. It ensures that evaluation considers the relevant session context without changing the original questions, answers, or conversation.

### AI action

AI may conceptually review:

- Candidate answers
- Answer quality
- Technical correctness where applicable
- Relevance
- Completeness
- Explanation quality
- Reasoning
- Missing important points
- Contextual follow-up performance
- Ability to respond to follow-up questions
- Overall consistency across the interview

The review remains conceptual. It does not define mathematical formulas, numerical weights, thresholds, scoring equations, confidence calculations, or model-specific evaluation methods.

### State change

Evaluation In Progress -> Interview Evidence / Answer Review -> Evidence Review Completed

### Next state

Evidence Review Completed -> Overall Evaluation

### Errors / failure cases

- Interview evidence is incomplete: evaluate only supported evidence and clearly avoid unsupported conclusions.
- Answer data is missing: do not invent a candidate answer; preserve the completed session and identify the limitation conceptually.
- Evidence is unclear: retain uncertainty rather than claiming more confidence than the available interview supports.
- Evidence review fails: preserve the completed interview state and provide a recoverable path to retry or continue evaluation.

### Exit / navigation

The candidate cannot edit completed answers or restart the interview from the evidence-review stage. Leaving preserves the completed session and any available evaluation context.

## Stage 3: Overall Evaluation

### User sees

The candidate understands that the system is forming an overall assessment from the completed interview evidence. The assessment is about interview practice and readiness improvement, not hiring eligibility or employment outcome.

### User action

The candidate waits for the overall evaluation and its structured outputs.

### System action

The system coordinates evaluation after evidence review, preserves the completed interview state, and keeps the evaluation separate from the live interview. It does not allow the evaluation stage to modify the interview conversation.

### AI action

AI assists with interpreting the evidence and forming conceptual conclusions about the candidate's demonstrated interview performance. It considers the quality and consistency of the answers and the candidate's handling of relevant follow-up interactions.

AI must not make a hired/rejected decision, employment recommendation, job eligibility decision, or placement guarantee.

### State change

Evidence Review Completed -> Overall Evaluation -> Actual Score and Feedback Preparation

### Next state

Overall Evaluation -> Actual Score

### Errors / failure cases

- Evaluation evidence remains unclear: provide a qualified assessment based only on supported observations.
- Evaluation cannot be completed immediately: preserve the completed interview and evaluation context without presenting fabricated conclusions.
- Partial evaluation is available: identify that the evaluation is partial and do not represent it as a complete assessment unless completion is established.
- Evaluation fails: preserve completed interview evidence and provide a recoverable evaluation state.

### Exit / navigation

Leaving the evaluation stage does not change the completed interview or grant the AI permission to restart it. The candidate may return to the results journey when evaluation is available.

## Stage 4: Actual Score

### User sees

The candidate understands that the Actual Score represents the system's final assessment of the candidate's interview performance based on relevant interview evidence. The Actual Score is not a hiring decision, placement prediction, or guarantee of interview success.

### User action

The candidate reviews the Actual Score as one part of the structured results and uses it together with the assessment and feedback to understand performance.

### System action

The system makes the Actual Score available only after the evaluation stage has produced its required conceptual assessment. It keeps the Actual Score associated with the completed interview and separate from the candidate's self-assessment.

No exact score range, formula, weighting, threshold, or aggregation method is defined in Phase 1.8.

### AI action

AI may assist in producing the Actual Score as part of the approved evaluation output, based on interview performance and relevant evidence. AI must not use the candidate's Expected Score as a calibration factor or substitute for evidence-based evaluation.

### State change

Overall Evaluation -> Actual Score Available

### Next state

Actual Score Available -> Strengths, Weaknesses, Improvement Areas, and Structured Feedback

### Errors / failure cases

- The Actual Score cannot be produced: preserve the evaluation evidence and explain that results are incomplete rather than inventing a score.
- Evaluation evidence is insufficient: do not manufacture an unsupported Actual Score; retain the limitation for recoverable handling.
- A duplicate evaluation attempt occurs: do not create conflicting Actual Scores for the same completed evaluation state.

### Exit / navigation

The candidate may leave the results journey, but the completed interview and available evaluation state remain unchanged. Detailed history and later review belong to later phases.

## Stage 5: Expected Score versus Actual Score

### Expected Score

The Expected Score is the candidate's self-assessment collected during the Phase 1.7 closing conversation. It is informational only.

### Actual Score

The Actual Score is the system's assessment of interview performance derived from relevant evidence in the completed interview.

### Independence rule

The Expected Score must not influence:

- Actual Score
- Overall Evaluation
- Strength identification
- Weakness identification
- Improvement Areas
- Actionable Feedback
- Results

The results may show both values for understanding, but they must make their independence clear. Phase 1.8 does not compare them using a mathematical formula.

## Stage 6: Strengths

### User sees

The candidate sees strengths that reflect demonstrated performance in the completed interview.

### User action

The candidate reviews positive observations and relates them to the interview evidence.

### System action

The system presents strengths as part of the structured evaluation and keeps them connected to the completed interview.

### AI action

AI identifies strengths only when supported by observed performance. Conceptual examples include:

- Strong technical understanding
- Clear explanation
- Good reasoning
- Relevant answers
- Strong handling of follow-up questions
- Consistent performance

AI must not invent strengths that are unsupported by the interview evidence.

### State change

Actual Score Available -> Strengths Identified

### Next state

Strengths Identified -> Weaknesses and Improvement Areas

### Errors / failure cases

If evidence does not support a particular strength, the system should omit or qualify that observation rather than presenting it as established fact.

### Exit / navigation

Leaving this part of the results journey does not modify the evaluation or completed interview.

## Stage 7: Weaknesses

### User sees

The candidate sees meaningful shortcomings observed during the interview, expressed respectfully and specifically.

### User action

The candidate reviews the weaknesses and identifies which areas require further practice.

### System action

The system presents weaknesses as observations connected to the completed answers and interview interactions.

### AI action

AI may identify:

- Incomplete answers
- Technical misunderstandings
- Weak reasoning
- Missing important concepts
- Difficulty handling follow-up questions
- Unclear explanations

AI must not treat natural English-Hindi language mixing as a weakness. English proficiency is not evaluated unless a future approved requirement explicitly makes language ability part of the interview.

### State change

Strengths Identified -> Weaknesses Identified

### Next state

Weaknesses Identified -> Improvement Areas

### Errors / failure cases

If the evidence does not support a weakness, the system should not invent or overstate it. Uncertainty should remain understandable to the candidate.

### Exit / navigation

Leaving this part of the results journey preserves the completed interview and evaluation state.

## Stage 8: Improvement Areas and Actionable Feedback

### User sees

The candidate understands what to practice next and receives guidance that connects observed performance to a practical improvement direction.

### User action

The candidate reviews the improvement areas and identifies a next practice focus. This phase does not create a separate learning platform or course system.

### System action

The system organizes observed weaknesses and gaps into understandable improvement areas and presents actionable feedback as part of the results. Recommendations remain tied to the completed interview and do not introduce external course or resource requirements.

### AI action

AI may convert observed gaps into guidance such as:

- Strengthen a particular technical concept.
- Improve explanation structure.
- Practice reasoning-based questions.
- Improve handling of follow-up questions.
- Revise specific knowledge gaps.

Actionable feedback should communicate:

What went well -> What needs improvement -> What the candidate should do next

Feedback should be specific, relevant, actionable, understandable, and supported by observed performance. Generic statements such as "Practice more" are insufficient without a connected explanation.

### State change

Weaknesses Identified -> Improvement Areas -> Actionable Feedback Prepared

### Next state

Actionable Feedback Prepared -> Overall Interview Assessment

### Errors / failure cases

- No clear improvement area is supported: provide only qualified observations rather than inventing a recommendation.
- Feedback generation is incomplete: preserve available evaluation evidence and identify that the results are partial.
- A recommendation is not connected to observed performance: omit or revise it rather than presenting unsupported advice.

### Exit / navigation

Leaving the feedback stage does not alter the completed interview or the evidence-based evaluation.

## Stage 9: Overall Interview Assessment

### User sees

The candidate receives a concise overall assessment summarizing overall performance, major strengths, major weaknesses, and an appropriate readiness or improvement direction.

The assessment is for interview practice and improvement. It is not a hired/rejected decision, employment recommendation, job eligibility decision, or placement guarantee.

### User action

The candidate reads and uses the overall assessment to understand the meaning of the detailed results.

### System action

The system makes the overall assessment available as part of the completed evaluation and ensures it remains associated with the completed interview.

### AI action

AI produces understandable overall assessment language from the supported evaluation evidence. It must not claim certainty beyond that evidence or make recruitment decisions.

### State change

Actionable Feedback Prepared -> Overall Interview Assessment

### Next state

Overall Interview Assessment -> Results Presentation

### Errors / failure cases

If the overall assessment cannot be completed, preserve the detailed evidence and feedback already available and identify that the assessment is incomplete rather than inventing a conclusion.

### Exit / navigation

Leaving the assessment stage preserves all completed interview and evaluation information.

## Stage 10: Results Presentation and Understanding

### User sees

The candidate can understand the following result categories:

- Actual Score
- Overall Assessment
- Strengths
- Weaknesses
- Improvement Areas
- Actionable Feedback

The candidate can distinguish the informational Expected Score from the independent Actual Score. The results are understandable as an assessment of interview practice, not a hiring outcome.

### User action

The candidate reviews the result information and confirms their understanding through the natural results-reading journey. No additional interview answer is required.

### System action

The system presents the completed evaluation outputs and keeps them associated with the completed interview. It does not restart or modify the interview conversation and does not expand the results into history, progress analytics, or re-practice behavior in this phase.

### AI action

AI may generate clear explanatory language for the evaluation outputs. It does not control results availability, alter completed evidence, or add unsupported conclusions.

### State change

Overall Interview Assessment -> Results Presentation -> Candidate Understands Results

### Next state

Candidate Understands Results -> Phase 1.8 Complete

History, progress analytics, re-practice, and other later navigation are deferred to later phases.

### Errors / failure cases

- Evaluation cannot be completed immediately: preserve Interview Completed and show that results are not yet complete; do not invent outputs.
- Results are partial: identify the available and unavailable sections clearly.
- A result category is missing: preserve supported evidence and avoid presenting the missing category as completed.
- The candidate leaves the results flow: preserve the completed evaluation state and allow later approved revisiting without changing the evidence.
- The candidate revisits results: show the same completed evaluation state unless a later approved correction process exists; do not silently regenerate conflicting results.
- An unexpected interruption occurs during evaluation or presentation: preserve completed interview state and available evaluation information for recoverable continuation.

### Exit / navigation

After the candidate understands the results, Phase 1.8 is complete. Navigation to History, Progress, Re-practice, or future capabilities is not defined in this phase.

## Text and Voice Evaluation Parity

### Text mode

Evaluation and feedback are based on the content and relevant performance evidence from the completed Text interview.

### Voice mode

Evaluation and feedback are based on the content and relevant performance evidence from the completed Voice interview. Voice-specific recognition, transcription, audio processing, providers, APIs, libraries, and architecture are outside this phase.

### Shared behavior

Text and Voice follow the same conceptual evaluation outputs and feedback categories. The selected mode must not itself determine the Actual Score, strengths, weaknesses, improvement areas, or overall assessment.

## Hinglish-First Evaluation and Feedback

When Hinglish is selected, natural mixed Hindi-English communication is valid and must not itself be treated as a weakness. Evaluation focuses on interview performance, including correctness, relevance, completeness, explanation quality, reasoning, follow-up handling, missing points, and improvement opportunities.

English proficiency is not evaluated unless an explicitly approved future requirement makes language ability part of the interview. Feedback should be understandable in the selected or supported communication style, while remaining professional and natural rather than literal translation.

## Phase 1.8 Completion Rules and Edge Cases

- **Evaluation cannot be completed immediately:** Preserve Interview Completed and provide a recoverable evaluation state without inventing results.
- **Incomplete interview evidence:** Use only supported evidence and identify limitations in the evaluation.
- **Missing answer data:** Do not invent an answer or unsupported conclusion.
- **Unclear evaluation evidence:** Preserve uncertainty and qualify the relevant assessment.
- **Evaluation failure:** Preserve completed interview state and allow conceptual recovery without modifying the interview.
- **Partial evaluation:** Identify the evaluation as partial and do not present it as complete.
- **Candidate leaves results flow:** Preserve completed evaluation information for later approved revisiting.
- **Candidate revisits results:** Present the established evaluation state without silently creating conflicting results.
- **Duplicate evaluation attempt:** Preserve one coherent evaluation lifecycle and avoid contradictory outputs.
- **Interview completion state already exists:** Treat it as the valid starting state for evaluation; do not restart the interview.
- **Unexpected interruption during evaluation:** Preserve completed evidence and available evaluation information for recoverable continuation.

## Phase 1.8 Completion State

Phase 1.8 is complete after the candidate can understand the final interview results:

**Results Presentation -> Candidate Understands Results -> Phase 1.8 Complete**

The next phases may define History, Progress, Re-practice, or other approved journeys. Those behaviors are not defined here.

## Phase 1.8 Consistency Rules

- Evaluation begins only after Interview Completed and does not modify or restart the completed interview.
- Actual Score is based on relevant interview evidence and is independent of Candidate Expected Score.
- Strengths, Weaknesses, Improvement Areas, Actionable Feedback, and Overall Assessment remain evidence-based and understandable.
- Natural Hinglish remains valid communication and is not itself a weakness; English proficiency is outside evaluation unless separately approved.
- Text and Voice have conceptual parity, and mode selection does not determine evaluation outcome.
- I-RIS does not make hiring, rejection, eligibility, employment, or placement decisions.
- The system controls evaluation lifecycle and results availability; AI assists with interpretation and explanation without inventing evidence or overriding lifecycle rules.
- No scoring formula, weights, thresholds, equations, confidence calculation, model-specific method, UI, API, database, technology, provider, or implementation decision is defined.
- History, Progress Analytics, Re-practice, Resume-based Interviews, and future advanced features remain outside this phase.

## Phase 1.9: Interview History, Results Review, Progress, and Re-practice

### Purpose and Boundary

This phase continues from the Phase 1.8 endpoint:

Phase 1.8 Complete -> Interview History -> Previous Interview Selection -> Previous Results Review -> Progress Understanding -> Performance Comparison -> Re-practice Decision -> Return to Interview Setup

Phase 1.9 defines how a candidate uses completed interview results over time to understand progress and continue practicing. It ends when the candidate either finishes reviewing history or progress while remaining outside an active interview, or chooses re-practice and enters the approved Interview Setup flow.

This phase does not define database schemas, APIs, implementation, scoring formulas, statistical methods, charts, hiring decisions, resume-based interviews, or other future features.

### System and AI Responsibility Boundary

The system controls history availability, completed interview records, history navigation, preservation of completed records, progress and history state, transition into re-practice, entry into a new interview setup journey, and lifecycle boundaries.

AI may assist with explaining previous feedback, helping the candidate understand improvement areas, or conversationally summarizing previous evaluation information where appropriate.

AI must not modify historical interview records, modify previous Actual Scores, invent historical evidence, independently delete history, independently restart an interview, make hiring decisions, or override system lifecycle and navigation rules.

## Stage 1: History Entry

### User sees

The candidate understands that completed interviews are available for review and that history represents previously completed practice sessions. The candidate can understand whether there are no completed interviews, one completed interview, or multiple completed interviews available.

### User action

The candidate opens Interview History from the approved results or progress journey and reviews the available completed interview records.

### System action

The system determines whether completed interview history is available and presents the appropriate conceptual state. Incomplete or uncompleted interviews are not presented as completed results.

### AI action

AI is not required to determine history availability, preserve records, or control history navigation. AI may later help explain a selected result, but it does not own history state.

### State change

Phase 1.8 Complete -> History Available or History Empty

### Next state

- Completed interviews exist -> History Available
- No completed interviews exist -> History Empty

### Errors / failure cases

- No interview history exists: explain that no completed interview is available yet and keep the candidate outside an active interview.
- History loading is interrupted: preserve the completed interview state and provide a recoverable history state.
- Historical result data is unavailable: do not invent records or results; identify that the history view is incomplete.
- Duplicate history records are present: present only a coherent conceptual record for each completed interview and do not create additional results.

### Exit / navigation

The candidate may leave history and remain outside an active interview. Returning later begins again from the appropriate History state without restarting any completed interview.

## Stage 2: History Available and Previous Interview Selection

### User sees

The candidate can conceptually identify a previous completed interview using useful contextual information such as:

- Interview Type
- Topic / Skill
- Difficulty
- Duration
- Language
- Mode
- Completion status
- Actual Score
- Date/time or another appropriate identification description

These are understandable history context, not database fields or schema definitions.

### User action

The candidate selects one completed interview they want to review.

### System action

The system identifies the selected completed interview and loads its available history and results context. It preserves the selected interview as a historical record and does not restart it automatically.

### AI action

AI is not required to identify, select, or preserve a previous interview. AI may assist after selection by explaining the available evaluation information.

### State change

History Available -> Previous Interview Selected

### Next state

Previous Interview Selected -> Previous Results Review

### Errors / failure cases

- The selected interview cannot be loaded: preserve existing history and provide a recoverable selection or return path.
- The selected record is incomplete: do not present it as a completed result; identify the limitation and preserve valid completed records.
- Available historical data is missing: do not invent results, answers, scores, or feedback.
- The candidate selects a record more than once: keep one review journey and do not create duplicate history states.

### Exit / navigation

The candidate may return to History Available, leave history, or remain outside an active interview. Selecting a previous interview never starts the active interview lifecycle.

## Stage 3: Previous Results Review

### User sees

The candidate can understand the previously generated evaluation information for the selected completed interview:

- Actual Score
- Overall Assessment
- Strengths
- Weaknesses
- Improvement Areas
- Actionable Feedback
- Relevant interview context

The previous result is understood as a record of that completed interview, not as a new evaluation request or a hiring judgment.

### User action

The candidate reviews the previous result, considers the feedback, and may decide whether to continue to Progress Review, return to History, or choose Re-practice.

### System action

The system presents the available historical result without silently changing it. Normal review does not modify candidate answers, the original conversation, the original Actual Score, or historical feedback.

### AI action

AI may explain previous feedback or summarize improvement areas conversationally when appropriate. It must use only the available historical information and must not invent evidence or rewrite the historical result.

### State change

Previous Interview Selected -> Previous Results Review

### Next state

- Review continues -> Progress Review or History Available
- Candidate wants more practice -> Re-practice Decision
- Candidate leaves -> Outside Active Interview

### Errors / failure cases

- A historical result is unavailable: preserve the selected record and identify which information cannot be shown.
- Historical feedback is partial: present it as partial rather than inventing missing sections.
- An interruption occurs during review: preserve the completed interview and available result context for recoverable return.
- The candidate opens the same result repeatedly: preserve one historical result without silently changing it.

### Exit / navigation

The candidate may return to History Available, continue to Progress Review, or choose Re-practice. Reviewing results does not enter Active Interview and does not restart the selected interview.

## Stage 4: Interview Record Integrity

### User sees

The candidate understands that completed interview history is preserved as a record of what happened in that session.

### User action

The candidate reviews the record without editing the original interview evidence or result.

### System action

The system preserves the original candidate answers, interview conversation, Actual Score, evaluation, feedback, and relevant context during normal review. Normal history review does not restart, overwrite, or rewrite the completed interview.

If explicitly approved re-evaluation is supported in a later phase, it must be treated as a separate controlled behavior. No re-evaluation functionality is defined here.

### AI action

AI may explain the preserved record but cannot modify historical answers, scores, feedback, or evidence. It cannot independently delete or rewrite interview history.

### State change

Previous Results Review -> Preserved Historical Record

### Next state

Preserved Historical Record -> Progress Review, Re-practice Decision, or Outside Active Interview

### Errors / failure cases

- Historical evidence is incomplete: preserve what exists and clearly identify the limitation.
- A historical value conflicts with another displayed value: do not silently rewrite the record; preserve the conflict for controlled review.
- An attempted modification occurs during review: keep the original completed record unchanged.

### Exit / navigation

The candidate can leave the record review without affecting the original interview. The record remains outside the active interview lifecycle.

## Stage 5: Progress Understanding

### User sees

The candidate can use completed interviews to understand practice progress and answer questions such as:

- Am I improving?
- Which areas are getting better?
- Which areas still need practice?
- How has interview performance changed over time?
- Which interview types or skills need more practice?

Progress is presented as practice insight and self-improvement information, not as a hiring judgment.

### User action

The candidate reviews available progress information across completed interviews and identifies areas to continue practicing.

### System action

The system makes relevant completed interview history and approved evaluation information available for conceptual progress understanding. It does not define or expose database aggregation logic, formulas, statistical models, chart implementation, or exact progress calculations in this phase.

### AI action

AI may help explain observed strengths, weaknesses, or improvement areas across completed results. It must use available evidence and must not invent a trend or claim certainty unsupported by the records.

### State change

Previous Results Review or History Available -> Progress Review

### Next state

Progress Review -> Performance Comparison, Re-practice Decision, History Available, or Outside Active Interview

### Errors / failure cases

- Only one completed interview exists: explain that limited history is available and avoid claiming a trend from a single record.
- Multiple interviews exist but some information is unavailable: preserve available records and identify the limitation.
- Progress information cannot be loaded: preserve completed interview history and provide a recoverable progress state.
- No comparable completed evidence exists: explain that comparison is limited rather than inventing progress.

### Exit / navigation

The candidate may return to History Available or Previous Results Review, choose Re-practice, or leave while remaining outside an active interview.

## Stage 6: Performance Comparison

### User sees

The candidate can conceptually compare relevant completed interview evidence and approved evaluation information over time. Useful comparison dimensions may include:

- Previous Actual Score versus a later Actual Score
- Strength patterns
- Repeated weaknesses
- Improvement areas
- Interview Type
- Topic / Skill
- Difficulty
- Overall Assessment

A single score does not completely represent candidate ability. Comparison supports practice insight rather than ranking or hiring judgment.

### User action

The candidate reviews changes and recurring patterns across completed interviews and identifies what to practice next.

### System action

The system keeps comparison limited to relevant completed interviews and available approved evaluation information. It does not define new scoring formulas, mathematical comparisons, statistical methods, ranking systems, or thresholds.

### AI action

AI may summarize visible patterns in strengths, weaknesses, improvement areas, and overall assessments. It must qualify uncertain patterns and must not present unsupported improvement or decline as fact.

### State change

Progress Review -> Performance Comparison

### Next state

Performance Comparison -> Re-practice Decision, Progress Review, History Available, or Outside Active Interview

### Errors / failure cases

- The comparison lacks enough completed evidence: explain that comparison is limited.
- Historical records use different configurations: preserve the context and avoid treating unlike sessions as directly equivalent without qualification.
- A comparison cannot be completed: preserve the underlying history and provide a recoverable progress state.

### Exit / navigation

The candidate may return to Progress Review, History Available, or choose Re-practice. Comparison never starts an active interview by itself.

## Stage 7: Re-practice Decision

### User sees

The candidate understands that they can practice again after reviewing results or progress. Re-practice means beginning a new interview journey, not reopening or overwriting an earlier completed session.

### User action

The candidate chooses whether to practice again. They may decide to use the same or a newly selected configuration without being required to follow an automatic recommendation plan.

### System action

The system records the user's transition out of history/progress review and starts a new interview setup journey only after the candidate chooses Re-practice. The previous interview remains available in History.

The system does not automatically generate a practice plan, learning algorithm, or configuration recommendation in this phase.

### AI action

AI may conversationally explain previous improvement areas, but it does not independently start re-practice, select a configuration without user direction, or overwrite the previous interview.

### State change

History, Previous Results Review, Progress Review, or Performance Comparison -> Re-practice Decision

### Next state

- Candidate chooses Re-practice -> Return to Interview Setup
- Candidate declines or leaves -> Outside Active Interview

### Errors / failure cases

- The candidate accidentally initiates a new interview while reviewing history: do not silently start it; keep the review state or require an explicit re-practice choice.
- The new setup journey cannot begin: preserve the previous history and provide a recoverable return path.
- The candidate changes their mind: remain outside an active interview and keep the previous records unchanged.

### Exit / navigation

The candidate may cancel Re-practice and return to History or Progress. Only an explicit choice proceeds to the approved Interview Setup journey.

## Stage 8: Return to Interview Setup

### User sees

The candidate understands that re-practice has entered the established Interview Setup flow for a new interview.

### User action

The candidate begins a new configuration journey using the already-approved Phase 1.3 setup behavior.

### System action

The system routes the candidate to the existing Interview Setup / Configuration Begins state and keeps the previous completed interview preserved in History. It does not redefine or duplicate the configuration system here.

### AI action

AI is not required for deterministic navigation into setup. AI does not independently start the new interview or choose configuration values on the candidate's behalf.

### State change

Re-practice Decision -> Return to Interview Setup -> New Interview Setup

This begins a new interview journey and does not reactivate the old interview.

### Next state

New Interview Setup -> The approved Phase 1.3 Interview Configuration flow

The complete new interview journey is not repeated in Phase 1.9.

### Errors / failure cases

- The setup state cannot be entered: preserve the old completed interview and return the candidate to History or Progress.
- A temporary interruption occurs during navigation: do not create a partial active interview or alter historical records.
- The candidate leaves immediately: preserve both the old history and the fact that no new interview was completed.

### Exit / navigation

Back or cancel returns to the appropriate History, Progress, or Results Review state. The previous interview remains preserved, and the new interview remains outside Active Interview until later approved phases are completed.

## Text and Voice History and Progress Behavior

### Text mode

History, results review, progress understanding, comparison, and re-practice conceptually apply to completed Text interviews. The mode may be part of the interview context used to identify and understand a record.

### Voice mode

History, results review, progress understanding, comparison, and re-practice conceptually apply to completed Voice interviews. Voice storage, transcription, audio processing, providers, APIs, libraries, and technical architecture are outside this phase.

### Shared behavior

Text and Voice follow the same history, integrity, progress, comparison, and re-practice rules. The selected mode must not itself determine whether the candidate is better or worse.

## Hinglish-First History and Progress Behavior

When Hinglish is selected, natural mixed Hindi-English communication is valid and must not appear as a weakness in history, progress, comparison, or feedback. Progress focuses on interview performance rather than language purity.

Hinglish remains the primary/default experience, with English and Hindi supported. Any explanation of previous feedback or progress should remain natural and professional in the selected or supported communication style. Translation architecture is not defined here.

## Phase 1.9 Completion Rules and Edge Cases

- **No interview history exists:** Present a History Empty state, preserve the candidate outside an active interview, and direct them only toward approved interview practice entry.
- **Only one completed interview exists:** Allow review while explaining that trend comparison is limited.
- **Multiple interviews exist:** Present History Available and allow selection of a completed record.
- **Selected history record cannot be loaded:** Preserve existing data and provide a recoverable selection or return path without inventing results.
- **Incomplete interview:** Do not present it as a completed result.
- **Historical result data is unavailable:** Preserve the completed record and identify the missing information.
- **Candidate leaves history and returns later:** Preserve completed records and return to the appropriate history state.
- **Candidate opens an old result repeatedly:** Preserve the same historical result without silently modifying it.
- **Candidate chooses re-practice:** Start a new setup journey only after explicit choice.
- **Candidate accidentally starts a new interview while reviewing history:** Do not create an active interview without an explicit re-practice choice.
- **Duplicate history records:** Keep a coherent conceptual history and do not create duplicate results.
- **Interrupted progress or results loading:** Preserve completed interview state and provide recoverable return behavior.

## Phase 1.9 Completion State

Phase 1.9 may end in either of two approved states:

1. **History / Progress Review Complete:** The candidate finishes reviewing history or progress and remains outside an active interview.
2. **New Interview Setup:** The candidate explicitly chooses Re-practice and enters the approved Interview Setup flow for a new interview.

The re-practice path is:

History / Results Review -> Re-practice Decision -> Return to Interview Setup -> New Interview Setup

## Phase 1.9 Consistency Rules

- History and progress represent completed interview practice and remain within approved I-RIS scope.
- Previous interview selection never automatically restarts an interview.
- Normal review preserves original answers, conversation, Actual Score, evaluation, feedback, and context.
- Re-practice always begins a new interview journey and never overwrites the previous interview.
- The existing Phase 1.3 Interview Setup flow remains the reference; it is not redefined here.
- Text and Voice share the same conceptual history and progress behavior, and mode alone does not determine performance.
- Hinglish remains primary/default and valid communication; it is not itself a weakness.
- Progress is for practice and self-improvement, not hiring, rejection, employment, placement, or eligibility decisions.
- The system controls history, integrity, progress state, navigation, and re-practice transition; AI may explain but cannot modify records or restart interviews independently.
- No database, API, implementation, scoring formula, threshold, ranking system, statistical method, unrelated analytics, or unauthorized feature is introduced.
