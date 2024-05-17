# Documentation: Lambda-Based AI Conversation Handler

## Overview

This codebase provides the infrastructure and logic for an AWS Lambda function designed to process new user message events. It leverages AI services to extract requirements from user messages and sends bot responses or error messages to AWS EventBridge for further processing and logging.

## Core Components

### `app.ts`
The primary file defining the Lambda handler which integrates various components to:
1. **Process incoming user messages**.
2. **Validate and extract requirements** using different AI models (OpenAI, Anthropic, Gemini).
3. **Send responses or errors** to AWS EventBridge.

### Key Functions
- **handler**: The entry point for the Lambda function, orchestrating various operations such as validation, extraction, and sending responses.
- **baseHandler**: Provides foundational functionality and middleware for the Lambda handler.
- **runConversationLogic**: Core logic that handles conversation processing, including invoking requirement extraction and building responses.

### Imports and Interactions
- **Event Handling & Validation**: Functions and types from `lambdaInterface/eventInterface` for validating request bodies and defining errors (e.g., `BodyJSONParseError`, `RequestBodyValidationError`, `getRequestBody`).
- **Environment Variables**: Validated using functions from `lambdaInterface/validateEnvironmentVariables`.
- **Secrets Management**: Retrieves secrets using functions from `secrets/getSecrets`.
- **AI Services**: Extract requirements with multiple AI models defined in `conversationLogic/requirementsExtraction`.
- **Response Conversion and EventBridge**: Converts bot responses using `lambdaInterface/convertBotResponseToFunctionResponse` and sends them via `lambdaInterface/sendEventBridgeMessage/putEvents`.
- **Logging and Middleware**: Utilizes `@middy/core` and `@middy/input-output-logger` for enhanced logging and middleware capabilities.

## Detailed Module Descriptions

### `secrets/getSecrets.ts`
Defines functions for fetching secrets from AWS Secrets Manager:
- **getSecret**: Fetch a single secret.
- **getSecrets**: Fetch multiple secrets concurrently and return as an object.

### `lambdaInterface/validateEnvironmentVariables.ts`
Handles environment variable validation:
- **ConversationLambdaEnvironmentVariables**: Type definition for environment variables.
- **EnvironmentVariableError**: Custom error class for missing environment variables.
- **validateEnvironmentVariables**: Function to validate and return environment variables.

### `lambdaInterface/sendEventBridgeMessage.ts`
Manages sending events to AWS EventBridge:
- **putEvents**: Function that utilizes the AWS SDK to send events to EventBridge.

### `lambdaInterface/eventInterface.ts`
Defines types and utility functions for handling 'newMessage' events:
- Types like **NewUserMessageEvent**, **ValidRequestBody**.
- Error classes like **BodyJSONParseError** and **RequestBodyValidationError**.
- Functions like **getRequestBody**, **validateRequestBody**.

### `lambdaInterface/convertBotResponseToFunctionResponse.ts`
Converts AI bot responses into a function-friendly format:
- **convertBotResponseToFunctionResponse**: Processes and structures bot responses.

### `dateTimeInterface/dateTimeInterface.ts`
Utility functions for date and time operations:
- **getCurrentTimezoneAwareDateString**
- **getCurrentDayOfWeekString**

### `conversationLogic/getUserRequirementsPrompt/contextBuilder.ts`
Builds contexts and validates chat types:
- Functions like **validateChatContext**, **requirementsContextBuilder**.

### `conversationLogic/getUserRequirementsPrompt/getUserRequirementsPromptBuilder.ts`
Generates chat prompts for requirement extraction:
- **requirementsExtractionChatPrompt**: Builds prompts from message history, contexts, and response actions.

### `conversationLogic/getUserRequirementsPrompt/responseActionsBuilder.ts`
Creates response actions descriptions:
- **responseActionBuilder**: Builds concatenated descriptions.
- **ResponseAction**: Type definition used in response action building.

### `conversationLogic/getUserRequirementsPrompt/systemMessages.ts`
Generates system messages for user interaction:
- Functions like **buildSystemMessage1**.

### `conversationLogic/requirementsExtraction.ts`
Extracts user requirements using various AI services:
- **requirementsExtraction* Functions**: (e.g., `requirementsExtractionOpenai`, `requirementsExtractionAnthropicSonnet`).
- Handles API interactions, logging, and error conversions.

### `conversationLogic/types.ts`
Defines types and enumerations used in chat and bot interactions:
- Types like **Message**, **ChatMessagesPrompt**.
- Enumerations like **BotActionType**, **BuildFlowMode**.

## Summary

The codebase is designed to be modular, leveraging AWS services and various AI models to handle user message events robustly. The main functional flows include:

1. **Message Reception**: New messages are received and validated.
2. **Requirement Extraction**: Employing AI services to understand and extract requirements from messages.
3. **Response Generation**: Constructing relevant bot responses.
4. **Event Dispatching**: Sending responses to AWS EventBridge for further processing.

By integrating these components, the system successfully manages user interactions, processes complex queries, and provides contextual responses, all while ensuring robust error handling and logging for operational monitoring.# customerDemos
