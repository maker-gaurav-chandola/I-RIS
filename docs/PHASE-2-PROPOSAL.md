# I-RIS Phase 2 Proposal

## Objective

Implement the approved controlled Voice Interview experience while preserving the existing I-RIS SessionEngine, interview lifecycle, AI analysis, follow-up, evaluation, history, and progress architecture.

## Phase 2 Scope

- Voice mode in Interview Setup
- Browser microphone capture
- Speech-to-text input
- Voice transport between frontend and backend/provider
- AI interviewer response generation using the existing AI boundary
- Text-to-speech interviewer output
- Voice turn state handling
- Interruption handling
- Partial/unclear speech recovery
- Voice initialization failure recovery
- Voice lifecycle synchronization with SessionEngine
- Text/Voice behavioral parity
- Voice-specific verification and E2E testing

## Architecture Principle

Voice is an interaction layer around the existing interview system.

SessionEngine remains the owner of:
- interview lifecycle
- duration
- question state
- answer submission
- follow-up decisions
- completion
- expected score
- evaluation

Voice infrastructure must not independently start, terminate, complete, or redefine an interview.

## Reference Architecture

Browser microphone
    ?
Frontend voice session
    ?
Voice transport
    ?
Speech-to-text
    ?
Existing interview answer pipeline
    ?
SessionEngine + AI Provider
    ?
Interviewer response text
    ?
Text-to-speech
    ?
Frontend audio playback

## MYRAA Reference

MYRAA may be used as an architectural reference for:
- microphone capture
- PCM audio handling
- WebSocket voice transport
- streamed audio playback
- interruption handling
- connection state handling
- reconnect/error concepts

MYRAA code and architecture must not be copied blindly. I-RIS voice must remain integrated with the existing I-RIS SessionEngine and provider boundaries.

## Voice State

Voice state is separate from interview lifecycle state.

Interview lifecycle remains:
not_started ? active ? closing ? completed / terminated

Voice interaction may independently have states such as:
idle
connecting
listening
processing
speaking
interrupted
error
disconnected

Voice state must never replace the deterministic interview lifecycle.

## Answer Handling

A spoken response becomes a normal I-RIS answer only after sufficient transcription is available.

The resulting text must enter the existing answer submission pipeline.

The existing AI analysis and follow-up system remains unchanged in responsibility.

## Failure Rules

Recoverable voice failures must:
- preserve the active interview session
- preserve already submitted answers
- avoid silently submitting incomplete speech
- provide retry/recovery
- avoid changing Text/Voice mode without explicit user action

## Text/Voice Parity

Text and Voice must use the same:
- questions
- interview configuration
- answer analysis
- follow-up logic
- duration rules
- completion rules
- expected-score behavior
- evaluation
- history
- progress
- re-practice behavior

Only the interaction mechanism changes.

## Out of Scope

- Webcam
- Emotion detection
- Facial analysis
- Hiring decisions
- Resume-based interviews
- Advanced personality analysis
- Uncontrolled autonomous interviewer lifecycle
- Replacing SessionEngine with a realtime voice agent

## Implementation Order

1. Document Phase 2 voice contract
2. Define provider/transport boundaries
3. Add voice state model
4. Add microphone/audio capture
5. Add STT path
6. Connect transcript to existing answer pipeline
7. Add TTS response path
8. Add interruption handling
9. Add failure/recovery handling
10. Enable Voice mode in setup
11. Integrate Active Interview UI
12. Add automated tests
13. Run live voice E2E verification
14. Update project status and documentation

## Approval Gate

This document is a proposal only.

Implementation begins only after Phase 2 scope and architecture are reviewed and approved.

## Approval

Status: APPROVED

Approved for implementation after review.
