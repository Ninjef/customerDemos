import { ResponseActionKey } from '../backendApi/citizenAiConversationBotMessageRouter';
import {
    ChatContext,
    ContextType,
    FlowGuideBuildFlowConversationUserMessage,
    FlowGuideBuildFlowConversationBotResponse,
    OpenAiChatMessageRole,
    RelevantChatContexts,
} from '../backendApi/flowGuideBuildFlowConversations';
import { ExpectedResponse } from '../conversationLogic/requirementsExtraction';

export const convertBotResponseToFunctionResponse = (
    inputBody: FlowGuideBuildFlowConversationUserMessage,
    botResponse: ExpectedResponse,
): FlowGuideBuildFlowConversationBotResponse => {
    const contexts: RelevantChatContexts = [];
    if (botResponse.requirementsSoFar.length > 0) {
        contexts.push({
            contextType: ContextType.REQUIREMENTS,
            value: botResponse.requirementsSoFar,
        });
    }
    const nonRequirementsContexts = inputBody.extraContext.filter(
        (context: ChatContext) => context.contextType !== ContextType.REQUIREMENTS,
    );
    if (nonRequirementsContexts) {
        contexts.concat(nonRequirementsContexts);
    }

    return {
        authorization: inputBody.authorization,
        conversationId: inputBody.conversationId,
        newMessage: {
            role: OpenAiChatMessageRole.ASSISTANT,
            text: botResponse.messageToUser || '',
        },
        responseActions: (botResponse.responseActions as unknown as ResponseActionKey[]) || [],
        contexts: contexts || [],
    };
};
