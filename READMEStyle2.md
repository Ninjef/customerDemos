# Codebase Documentation

## Table of Contents
1. [Overview of the Codebase](#overview-of-the-codebase)
    - [High-Level Architecture](#high-level-architecture)
    - [Data Flow Sequences](#data-flow-sequences)
2. [Detailed Summaries of Key Files](#detailed-summaries-of-key-files)
    - [app.ts](#app-ts)
    - [secrets/getSecrets.ts](#secrets-getSecrets-ts)
    - [lambdaInterface/convertBotResponseToFunctionResponse.ts](#lambdaInterface-convertBotResponseToFunctionResponse-ts)
    - [lambdaInterface/eventInterface.ts](#lambdaInterface-eventInterface-ts)
    - [lambdaInterface/sendEventBridgeMessage.ts](#lambdaInterface-sendEventBridgeMessage-ts)
    - [lambdaInterface/validateEnvironmentVariables.ts](#lambdaInterface-validateEnvironmentVariables-ts)
    - [dateTimeInterface/dateTimeInterface.ts](#dateTimeInterface-dateTimeInterface-ts)
    - [conversationLogic/getUserRequirementsPrompt/contextBuilder.ts](#conversationLogic-getUserRequirementsPrompt-contextBuilder-ts)
    - [conversationLogic/getUserRequirementsPrompt/getUserRequirementsPromptBuilder.ts](#conversationLogic-getUserRequirementsPrompt-getUserRequirementsPromptBuilder-ts)
    - [conversationLogic/getUserRequirementsPrompt/responseActionsBuilder.ts](#conversationLogic-getUserRequirementsPrompt-responseActionsBuilder-ts)
    - [conversationLogic/getUserRequirementsPrompt/systemMessages.ts](#conversationLogic-getUserRequirementsPrompt-systemMessages-ts)
    - [conversationLogic/requirementsExtraction.ts](#conversationLogic-requirementsExtraction-ts)
    - [conversationLogic/types.ts](#conversationLogic-types-ts)
3. [Top 10 Unit Tests Recommendations](#top-10-unit-tests-recommendations)
    - [Importance Ratings](#importance-ratings)

---

## Overview of the Codebase

### High-Level Architecture
The codebase is organized into several key modules:
1. **AWS Lambda Functions**: Handles events and integrates with AWS EventBridge and Secrets Manager.
2. **Conversation Logic**: Processes user messages, interacts with AI models, and orchestrates conversation flows.
3. **Utility Modules**: Includes date-time utilities and environment variable validation.

### Data Flow Sequences
**Sequence 1: Handling a New User Message Event**
1. **From `app.ts`:**
   - Validates environment variables.
   - Parses the incoming user message event.
   - Retrieves necessary secrets from AWS Secrets Manager.
   - Invokes the appropriate conversation logic based on the event data.
   - Converts the bot response into a function response format.
   - Sends the response via AWS EventBridge.
   - Logs all steps and handles errors accordingly.

**Sequence 2: Requirements Extraction Using AI Models**
1. **From `requirementsExtraction.ts`:**
   - Constructs prompts based on conversation history and context.
   - Interacts with various AI models (OpenAI, Anthropic Sonnet, Gemini) to extract requirements.
   - Processes the AI model responses.
   - Logs the extraction flow and handles any errors encountered.

## Detailed Summaries of Key Files

### app.ts
**Summary:** 
Defines an AWS Lambda handler for processing new user message events. It validates environment variables, retrieves secrets, processes messages through a conversation bot, converts the bot's response, and sends it via EventBridge. Includes error handling for different error types.

**Key Functions and Imports:**
- Functions: `runConversationLogic`, `baseHandler`, `handler`
- Key Imports: `BodyJSONParseError`, `RequestBodyValidationError`, `getRequestBody`, `NewUserMessageEvent`, `getSecrets`, ... (others from `./lambdaInterface`, `./conversationLogic`, `./backendApi`, and `@middy/core`)

**Unit Test Cases:**
- Test handler processes valid `NewUserMessageEvent` and sends a proper response.
- Test handler identifies non-retryable errors.
- Test handler identifies retryable errors.
- Test environment variable validation function.
- Test `getSecrets` function.
- Test requirements extraction logic (e.g., `requirementsExtractionAnthropicSonnet`).
- Test `convertBotResponseToFunctionResponse` function.


### secrets/getSecrets.ts
**Summary:**
Provides functionality to retrieve secrets from AWS Secrets Manager. Defines async functions to retrieve single or multiple secrets.

**Key Functions and Imports:**
- Functions: `getSecret`, `getSecrets`
- Key Imports: `SecretsManagerClient`, `GetSecretValueCommand`

**Unit Test Cases:**
- Test `getSecret` with valid and invalid secret names.
- Test `getSecrets` with valid and invalid secret names.


### lambdaInterface/convertBotResponseToFunctionResponse.ts
**Summary:**
Converts a bot's response into a format suitable for further processing in conversation flow.

**Key Functions and Imports:**
- Functions: `convertBotResponseToFunctionResponse`
- Key Imports: `ResponseActionKey`, `ChatContext`, `ContextType`, ...

**Unit Test Cases:**
- Test bot response processing with varying inputs.
- Ensure correct transformation of contexts and response actions.


### lambdaInterface/eventInterface.ts
**Summary:**
Defines functions for handling new user message events, including custom error classes, request body parsing and validation, and message role conversion functions.

**Key Functions and Imports:**
- Functions: `BodyJSONParseError`, `RequestBodyValidationError`, `getRequestBody`, `validateRequestBody`, `convertToOpenaiChatMessageRole`
- Key Imports: `EventBridgeEvent`, `ChatContext`, `ContextType`, ...

**Unit Test Cases:**
- Test `getRequestBody` with valid and invalid events.
- Test `validateRequestBody` with various invalid request bodies.
- Test `convertToOpenaiChatMessageRole` with valid and invalid message history.


### lambdaInterface/sendEventBridgeMessage.ts
**Summary:**
Sends events to AWS EventBridge. `putEvents` constructs and sends events using AWS SDK.

**Key Functions and Imports:**
- Functions: `putEvents`
- Key Imports: `EventBridgeClient`, `PutEventsCommand`

**Unit Test Cases:**
- Test `putEvents` with correct and incorrect parameters.
- Handle AWS EventBridge client errors.


### lambdaInterface/validateEnvironmentVariables.ts
**Summary:**
Validates required environment variables and throws errors for missing ones.

**Key Functions and Imports:**
- Functions: `ConversationLambdaEnvironmentVariables`, `EnvironmentVariableError`, `validateEnvironmentVariables`

**Unit Test Cases:**
- Test presence and correctness of environment variables.

### dateTimeInterface/dateTimeInterface.ts
**Summary:**
Utility functions for date and time operations, such as getting the current date and time in a timezone-aware format.

**Key Functions and Imports:**
- Functions: `getCurrentTimezoneAwareDateString`, `getCurrentDayOfWeekString`

**Unit Test Cases:**
- Test date and time formatting.
- Test day of the week calculation.


### conversationLogic/getUserRequirementsPrompt/contextBuilder.ts
**Summary:**
Functions for validating and converting chat context values into readable text.

**Key Functions and Imports:**
- Functions: `validateChatContext`, `requirementsContextBuilder`, `workflowDefinitionMessageBuilder`, `contextTypeToTextFunctions`
- Key Imports: `AllowedContextValues`, `ChatContext`, `ContextType`, ...

**Unit Test Cases:**
- Test chat context validation with various contexts.
- Ensure correct text conversion.


### conversationLogic/getUserRequirementsPrompt/getUserRequirementsPromptBuilder.ts
**Summary:**
Constructs a chat prompt for user requirements extraction by building a system message and appending user's message history.

**Key Functions and Imports:**
- Functions: `requirementsExtractionChatPrompt`
- Key Imports: `ResponseAction`, `ChatMessagesPrompt`, `Message`, ...

**Unit Test Cases:**
- Ensure correct prompt construction with various inputs.


### conversationLogic/getUserRequirementsPrompt/responseActionsBuilder.ts
**Summary:**
Defines a type and function to convert an array of response actions into a formatted string.

**Key Functions and Imports:**
- Functions: `ResponseAction`, `responseActionBuilder`

**Unit Test Cases:**
- Test with varying arrays of response actions.


### conversationLogic/getUserRequirementsPrompt/systemMessages.ts
**Summary:**
Functions for building system messages to interact with users and process bot responses.

**Key Functions and Imports:**
- Functions: `buildSystemMessage1`, `systemMessage1GetBotResponseAsSingleMessage`, ...
- Key Imports: `RelevantChatContexts`, `getCurrentTimezoneAwareDateString`, `validateChatContext`, ...

**Unit Test Cases:**
- Test system message building with varying contexts.
- Test bot response processing.


### conversationLogic/requirementsExtraction.ts
**Summary:**
Handles requirements extraction from conversation histories using various AI models. Custom error classes handle specific errors.

**Key Functions and Imports:**
- Functions: `requirementsExtractionOpenai`, `requirementsExtractionGemini1_5`, ...
- Key Imports: `ChatMessagesPrompt`, `Message`, `ResponseAction`, ...

**Unit Test Cases:**
- Test requirements extraction with varying inputs and models.
- Test custom error classes.

### conversationLogic/types.ts
**Summary:**
Defines TypeScript interfaces and enums for handling messaging and bot actions within the conversation platform.

**Key Functions and Imports:**
- Types: `Message`, `ChatMessagesPrompt`, `HandlerEvent`, ...
- Key Imports: `OpenAiChatMessageRole`, `RelevantChatContexts`, ...

**Unit Test Cases:**
- Validate TypeScript interfaces enforce correct structure.

## Top 10 Unit Tests Recommendations
### Importance Ratings (1-10)

1. **Test that the handler correctly processes a valid NewUserMessageEvent and sends a proper response.**
   - Importance: 10

2. **Test that the handler correctly identifies and handles non-retryable errors such as BodyJSONParseError, EnvironmentVariableError, RequestBodyValidationError, and ChatPromptCreationError.**
   - Importance: 9

3. **Test that the environment variable validation function correctly identifies missing or invalid environment variables.**
   - Importance: 8

4. **Test that the getSecrets function is called with the correct parameters and returns the expected secrets.**
   - Importance: 8

5. **Test prompt construction and response handling in `requirementsExtractionOpenai`.**
   - Importance: 8

6. **Test validateChatContext with a valid REQUIREMENTS context.**
   - Importance: 7

7. **Test buildSystemMessage1 with valid RelevantChatContexts and possibleResponseActions.**
   - Importance: 7

8. **Test that the convertBotResponseToFunctionResponse function correctly transforms bot responses into the expected format.**
   - Importance: 7

9. **Test the requirements extraction logic (requirementsExtractionAnthropicSonnet) with various inputs to ensure it correctly processes the request body.**
   - Importance: 7

10. **Test that the `putEvents` function sends an event with the correct source, detail, detailType, and resources.**
    - Importance: 6