import { OpenAiChatMessageRole, RelevantChatContexts } from '../backendApi/flowGuideBuildFlowConversations';
import { OpenAiChatMessage } from '../openaiApi/completions';

export interface Message {
    text: string;
    role: OpenAiChatMessageRole;
    date?: string;
}

export type ChatMessagesPrompt = OpenAiChatMessage[];

export interface HandlerEvent {
    arguments: {
        conversationHistory: Message[];
        relevantChatContext: RelevantChatContexts;
    };
}

// TODO: Move shared types to their own file for easy copy/pasting
export enum BotActionType {
    BUILD_FLOW = 'BUILD_FLOW',
    EDIT_FLOW = 'EDIT_FLOW',
}

export enum BuildFlowMode {
    BUILD_FLOW = 'BUILD_FLOW',
    EDIT_FLOW = 'EDIT_FLOW',
}

export interface BotResponse {
    message: string;
    botAction: BotActionType;
    flowId: string | null;
    statusCode: number;
}

export type HandlerResponse = BotResponse;
