import { EventBridgeEvent } from 'aws-lambda';
import { ChatContext, ContextType, FlowGuideBuildFlowConversationUserMessage, OpenAiChatMessageRole, RelevantChatContexts } from '../backendApi/flowGuideBuildFlowConversations';
import zod from 'zod';
import { ResponseActionKey } from '../backendApi/citizenAiConversationBotMessageRouter';

export type NewUserMessageEvent = EventBridgeEvent<'newMessage', FlowGuideBuildFlowConversationUserMessage>

export class BodyJSONParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BodyJSONParseError';
    }
}

export class RequestBodyValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RequestBodyValidationError';
    }
}

type ValidRequestBody = {
    authorization: string;
    conversationId: string;
    messageHistory: {
        role: string;
        text: string;
    }[];
    extraContext?: ChatContext[];
    possibleResponseActions?: {
        responseActionKey: string;
        responseActionDescription: string;
    }[];
};

export const getRequestBody = (event: NewUserMessageEvent): FlowGuideBuildFlowConversationWithOpenaiMessages => {
    const body = event.detail;

    validateRequestBody(body);
    const openaiMessageHistory = convertToOpenaiChatMessageRole(body.messageHistory);
    return {
        ...body,
        messageHistory: openaiMessageHistory,
    };
};

// Use zod to validate the request body
const validateRequestBody = (requestBody: FlowGuideBuildFlowConversationUserMessage): ValidRequestBody => {
    const validRequestBodySchema = zod.object({
        authorization: zod.string(),
        conversationId: zod.string(),
        messageHistory: zod.array(zod.object({
            role: zod.string(),
            text: zod.string(),
        })),
        extraContext: zod.array(zod.object({
            contextType: zod.enum([ContextType.REQUIREMENTS, ContextType.WORKFLOW_DEFINITION, ContextType.WORKFLOW_RUN_INSTANCE]),
            value: zod.object({
                workflowDescription: zod.string(),
                workflowId: zod.string(),
                workflowJson: zod.string(),
                originalRequirements: zod.string(),
            }),
        })),
        possibleResponseActions: zod.array(zod.object({
            responseActionKey: zod.string(),
            responseActionDescription: zod.string(),
        })),
    });

    const validRequestBody = validRequestBodySchema.parse(requestBody);
    return validRequestBody;
}

const convertToOpenaiChatMessageRole = (messageHistory: FlowGuideBuildFlowConversationUserMessage['messageHistory']): FlowGuideBuildFlowConversationWithOpenaiMessages['messageHistory'] => {
    const messageHistoryUpdated = messageHistory.map((message) => {
        if (message.role.toLowerCase() === 'user') {
            return {
                ...message,
                role: OpenAiChatMessageRole.USER,
            };
        } else if (message.role.toLowerCase() === 'assistant') {
            return {
                ...message,
                role: OpenAiChatMessageRole.ASSISTANT,
            }
        } else if (message.role.toLowerCase() === 'system') {
            return {
                ...message,
                role: OpenAiChatMessageRole.SYSTEM
            };
        }
        throw new Error(`Invalid message role: ${message.role}`);
    });

    return messageHistoryUpdated
};

type FlowGuideBuildFlowConversationWithOpenaiMessages = {
    authorization: string;
    conversationId: string;
    messageHistory: {
        role: OpenAiChatMessageRole;
        text: string;
    }[];
    extraContext: RelevantChatContexts;
    possibleResponseActions: {
        responseActionKey: ResponseActionKey;
        responseActionDescription: string;
    }[];
};