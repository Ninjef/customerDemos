import { ChatMessagesPrompt, Message } from './types';
import { ResponseAction } from './getUserRequirementsPrompt/responseActionsBuilder';
import { createChatCompletionGemini1_5, createChatCompletionGemini1_0, createChatCompletionOpenai, createChatCompletionAnthropicSonnet, CreateChatCompletionAnthropicParams } from '../openaiApi/completions';
import { getMaxChatTokens } from '../openaiApi/getMaxTokens';
import { OpenAiChatMessageRole, RelevantChatContexts } from '../backendApi/flowGuideBuildFlowConversations';
import logger from '../logger';
import { buildSystemMessage1 } from './getUserRequirementsPrompt/systemMessages';
import { StartChatParams } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export const requirementsExtractionOpenai = async (
    openAiKey: string,
    conversationHistory: Message[],
    relevantChatContext: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): Promise<ExpectedResponse> => {
    let prompt: ChatMessagesPrompt;
    let promptTools;
    let maxTokens;
    let model;

    try {
        promptTools = buildSystemMessage1(relevantChatContext, possibleResponseActions);
        const systemMessage = promptTools.prompt;
        prompt = [
            {
                content: systemMessage,
                role: OpenAiChatMessageRole.SYSTEM,
            },
            ...conversationHistory.map((message) => ({
                content: message.text,
                role: message.role,
            })),
        ];

        logger.debug('prompt', {prompt});

        maxTokens = getMaxChatTokens(prompt, 16000, 4000);

        if (maxTokens <= 0) {
            throw new TokenLimitError('maxTokens is 0');
        }

        model = 'gpt-3.5-turbo-0125';

    } catch (err) {
        logger.error('Error creating chat prompt:', {error: err});
        throw new ChatPromptCreationError(`Error creating chat prompt: ${err}`);
    }

    let completionResponse;
    try {
        completionResponse = await createChatCompletionOpenai(openAiKey, {
            model,
            messages: prompt,
            max_tokens: maxTokens,
            temperature: 0.01,
            response_format: { "type": "json_object" },
            frequency_penalty: 0.6,
        });
    } catch (err) {
        logger.error('Error from OpenAI:', {error: err});
        throw new Error(`Error from OpenAI: ${err}`);
    }

    logger.debug('LLM response', {response: completionResponse.data});
    const responseMessage = completionResponse.data.choices[0].message.content;

    logger.debug('message that should be JSON', {responseMessage});

    const validMessage = promptTools.getBotResponseAsSingleMessage(responseMessage);

    return {
        requirementsSoFar: '',
        messageToUser: validMessage,
        responseActions: [],
    };
};

const openaiRoleToAnthropicRole: Record<OpenAiChatMessageRole, 'user' | 'assistant'> = {
    [OpenAiChatMessageRole.USER]: 'user',
    [OpenAiChatMessageRole.ASSISTANT]: 'assistant',
    [OpenAiChatMessageRole.SYSTEM]: 'user',
};

export const requirementsExtractionAnthropicSonnet = async (
    anthropicKey: string,
    conversationHistory: Message[],
    relevantChatContext: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): Promise<ExpectedResponse> => {
    let messages: CreateChatCompletionAnthropicParams['messages']
    let promptTools;
    let maxTokens;
    let model;
    let systemMessage;

    try {
        promptTools = buildSystemMessage1(relevantChatContext, possibleResponseActions);
        systemMessage = promptTools.prompt;
        model = 'claude-3-sonnet-20240229';

        const messagesWithoutSystemMessages = conversationHistory.filter((message) => message.role !== OpenAiChatMessageRole.SYSTEM);
        messages = messagesWithoutSystemMessages.map((message) => ({content: message.text, role: openaiRoleToAnthropicRole[message.role]}));
        maxTokens = 2000;

    } catch (err) {
        logger.error('Error creating chat prompt:', {error: err});
        throw new ChatPromptCreationError(`Error creating chat prompt: ${err}`);
    }

    let completionResponse;
    try {
        completionResponse = await createChatCompletionAnthropicSonnet(anthropicKey, {
            model,
            messages,
            system: systemMessage,
            max_tokens: maxTokens,
            temperature: 0.1
        }) as Anthropic.Messages.Message
    } catch (err) {
        logger.error('Error from OpenAI:', {error: err});
        throw new Error(`Error from OpenAI: ${err}`);
    }

    logger.debug('LLM response', {response: completionResponse.content});
    const responseMessage = completionResponse

    logger.debug('message that should be JSON', {responseMessage: responseMessage});

    const validMessage = promptTools.getBotResponseAsSingleMessagePreRegex(responseMessage.content[0].text);

    return {
        requirementsSoFar: '',
        messageToUser: validMessage,
        responseActions: [],
    };
};


const openaiRoleToGeminiRole: Record<OpenAiChatMessageRole, string> = {
    [OpenAiChatMessageRole.USER]: 'user',
    [OpenAiChatMessageRole.ASSISTANT]: 'model',
    [OpenAiChatMessageRole.SYSTEM]: 'system',
};

export const requirementsExtractionGemini1_5 = async (
    geminiKey: string,
    conversationHistory: Message[],
    relevantChatContext: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): Promise<ExpectedResponse> => {
    let systemMessage: StartChatParams['systemInstruction'];
    let promptTools;
    let messageHistoryFormattedForGemini: StartChatParams['history'];
    let mostRecentMessage: string;

    try {
        promptTools = buildSystemMessage1(relevantChatContext, possibleResponseActions);
        systemMessage = { role: 'system', parts: [{text: promptTools.prompt}] }
        mostRecentMessage = conversationHistory.pop()?.text ?? '';
        if (!mostRecentMessage) {
            throw new ExpectedResponseError('No message to respond to');
        }
        messageHistoryFormattedForGemini = conversationHistory.map((message) => ({
            parts: [{text: message.text}],
            role: openaiRoleToGeminiRole[message.role],
        }));

        logger.debug('prompt', {systemMessage, messageHistoryFormattedForGemini, mostRecentMessage});

    } catch (err) {
        logger.error('Error creating chat prompt:', {error: err});
        throw new ChatPromptCreationError(`Error creating chat prompt: ${err}`);
    }

    let completionResponse;
    try {
        completionResponse = await createChatCompletionGemini1_5(geminiKey, {maxOutputTokens: 2000}, messageHistoryFormattedForGemini, mostRecentMessage, systemMessage);
    } catch (err) {
        logger.error('Error from Gemini API:', {error: err});
        throw new Error(`Error from Gemini API: ${err}`);
    }

    logger.debug('LLM response', {responseText: completionResponse.response.text(), promptFeedback: completionResponse.response.promptFeedback});
    const responseMessage = completionResponse.response.text();

    const messageToUser = promptTools.getBotResponseAsSingleMessagePreRegex(responseMessage);

    logger.debug('message that should be JSON', {responseMessage});

    return {
        requirementsSoFar: '',
        messageToUser: messageToUser,
        responseActions: [],
    };
};

export const requirementsExtractionGemin1_0 = async (
    geminiKey: string,
    conversationHistory: Message[],
    relevantChatContext: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): Promise<ExpectedResponse> => {
    let promptTools;
    let messageHistoryFormattedForGemini: StartChatParams['history'];
    let mostRecentMessage: string;

    try {
        promptTools = buildSystemMessage1(relevantChatContext, possibleResponseActions);
        const systemMessagePartOfFirstMessage = promptTools.prompt
        const firstMessage = conversationHistory[0];
        if (!firstMessage) {
            throw new ExpectedResponseError('No message to respond to');
        }

        const firstMessageWithSystemMessageAtBeginning = {
            ...firstMessage,
            text: `${systemMessagePartOfFirstMessage}\n\nFirst message from user: ${firstMessage.text}`,
        };

        conversationHistory[0] = firstMessageWithSystemMessageAtBeginning;

        mostRecentMessage = conversationHistory.pop()?.text ?? '';
        if (!mostRecentMessage) {
            throw new ExpectedResponseError('No message to respond to');
        }
        messageHistoryFormattedForGemini = conversationHistory.map((message) => ({
            parts: [{text: message.text}],
            role: openaiRoleToGeminiRole[message.role],
        }));

        logger.debug('prompt', {messageHistoryFormattedForGemini, mostRecentMessage});

    } catch (err) {
        logger.error('Error creating chat prompt:', {error: err});
        throw new ChatPromptCreationError(`Error creating chat prompt: ${err}`);
    }

    let completionResponse;
    try {
        completionResponse = await createChatCompletionGemini1_0(geminiKey, {maxOutputTokens: 2000}, messageHistoryFormattedForGemini, mostRecentMessage);
    } catch (err) {
        logger.error('Error from Gemini API:', {error: err});
        throw new Error(`Error from Gemini API: ${err}`);
    }

    logger.debug('LLM response', {responseText: completionResponse.response.text(), promptFeedback: completionResponse.response.promptFeedback});
    const responseMessage = completionResponse.response.text();

    const messageToUser = promptTools.getBotResponseAsSingleMessageGemini(responseMessage);

    logger.debug('message that should be JSON', {responseMessage});

    return {
        requirementsSoFar: '',
        messageToUser: messageToUser,
        responseActions: [],
    };
};


export enum IntentType {
    BUILD_FLOW = 'BUILD_FLOW',
    EDIT_FLOW = 'EDIT_FLOW',
}

export class TokenLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenLimitError';
    }
}

export type ExpectedResponse = {
    requirementsSoFar: string;
    messageToUser: string;
    responseActions: string[];
};

export class ExpectedResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ExpectedResponseError';
    }
}

export class ChatPromptCreationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ChatPromptCreationError';
    }
}
