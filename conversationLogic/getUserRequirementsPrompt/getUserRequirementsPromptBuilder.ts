import { ResponseAction } from './responseActionsBuilder';
import { ChatMessagesPrompt, Message } from '../types';
import { buildSystemMessage1 } from './systemMessages';
import { OpenAiChatMessageRole, RelevantChatContexts } from '../../backendApi/flowGuideBuildFlowConversations';

export const requirementsExtractionChatPrompt = (
    messageHistory: Message[],
    relevantChatContexts: RelevantChatContexts,
    possibleResponseActions: ResponseAction[],
): ChatMessagesPrompt => {
    const promptTools = buildSystemMessage1(relevantChatContexts, possibleResponseActions);
    const systemMessage = promptTools.prompt;

    return [
        {
            content: systemMessage,
            role: OpenAiChatMessageRole.SYSTEM,
        },
        ...messageHistory.map((message) => ({
            content: message.text,
            role: message.role,
        })),
    ];
};
