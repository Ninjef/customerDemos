import { RelevantChatContexts } from '../../backendApi/flowGuideBuildFlowConversations';
import {
    getCurrentTimezoneAwareDateString,
    getCurrentDayOfWeekString,
} from '../../dateTimeInterface/dateTimeInterface';
import { validateChatContext, contextTypeToTextFunctions } from './contextBuilder';
import { responseActionBuilder, ResponseAction } from './responseActionsBuilder';
import { z } from 'zod';
import logger from './../../logger';

export const buildSystemMessage1 = (
    relevantChatContexts: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): PromptTools => {
    const contextTexts = relevantChatContexts.map((context) => {
        if (!context?.contextType) {
            return '';
        }

        const contextTextFunction = contextTypeToTextFunctions[context.contextType];
        if (!contextTextFunction) {
            throw new Error(`No context text function found for context type: ${context.contextType}`);
        }
        const validatedContext = validateChatContext(context);
        return contextTextFunction(validatedContext.value);
    });
    logger.info('contextTexts', {contextTexts});

    const responseActionText = responseActionBuilder(possibleResponseActions);
    logger.info('responseActionText', {responseActionText});

    return { prompt: `<redacted from this repo for IP reasons>`,
    getBotResponseAsSingleMessage: systemMessage1GetBotResponseAsSingleMessage,
    getBotResponseAsSingleMessagePreRegex: systemMessage1GetBotResponseAsSingleMessagePreRegex,
};
};

type PromptTools = {
    prompt: string;
    getBotResponseAsSingleMessage: (response: string) => string;
    getBotResponseAsSingleMessagePreRegex: (response: string) => string;
};

type ExpectedResponse = {
// redacted from this repo for IP reasons
};

const systemMessage1ExpectedResponseSchema = z.object({
// redacted from this repo for IP reasons
});

const systemMessage1ExpectedResponseSchemaLax = z.object({
// redacted from this repo for IP reasons
});

const systemMessage1GetBotResponseAsSingleMessage = (response: string): string => {
    const parsedResponse: ExpectedResponse = JSON.parse(response || '{}');
    
    logger.debug('parsedResponse', {parsedResponse});

    const validatedResponse = systemMessage1ExpectedResponseSchema.parse(parsedResponse);

    const botIsDoneAskingQuestions = validatedResponse.haveIAlreadyAskedTheseQuestions;
    const botResponse = botIsDoneAskingQuestions ? 'No further questions to ask.' : validatedResponse.newQuestionsToConfirmUnderstanding[0];

    return botResponse;
}

const systemMessage1GetBotResponseAsSingleMessagePreRegex = (response: string): string => {
    const jsonRegexPattern = /\{[^{}]*\}/
    const responseJsonSection = response.match(jsonRegexPattern)?.[0] || '';

    const parsedResponse: ExpectedResponse = JSON.parse(responseJsonSection || '{}');

    logger.debug('parsedResponse', {parsedResponse});

    const validatedResponse = systemMessage1ExpectedResponseSchemaLax.parse(parsedResponse);
    const botIsDoneAskingQuestions = validatedResponse.haveIAlreadyAskedTheseQuestions || !validatedResponse.questionsAsASingleMessage;

    if (botIsDoneAskingQuestions) {
        return "I can write this as a Snapp if you're ready. Just click the \"Build Snapp\" button.";
    }

    const botResponse = validatedResponse.questionsAsASingleMessage ?? '';

    return botResponse;
}
