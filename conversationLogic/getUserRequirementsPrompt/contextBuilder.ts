import {
    AllowedContextValues,
    ChatContext,
    ContextType,
    RequirementsContextValue,
    WorkflowDefinitionContextValue
} from '../../backendApi/flowGuideBuildFlowConversations';
import logger from '../../logger';

export const validateChatContext = (chatContext: ChatContext) => {
    if (!chatContext.contextType) {
        throw new Error('contextType is required');
    }
    if (!chatContext.value) {
        throw new Error('value is required');
    }
    if (chatContext.contextType === ContextType.REQUIREMENTS) {
        const requirementsContextValue = chatContext.value as RequirementsContextValue;
        if (typeof requirementsContextValue !== 'string') {
            throw new Error('value must be a string');
        }
    }
    if (chatContext.contextType === ContextType.WORKFLOW_DEFINITION) {
        const workflowDefinitionContextValue = chatContext.value as WorkflowDefinitionContextValue;
        if (!workflowDefinitionContextValue.workflowDescription) {
            throw new Error('value.workflowDescription is required');
        }
        if (!workflowDefinitionContextValue.workflowId) {
            throw new Error('value.workflowId is required');
        }
    }

    return chatContext;
};

const requirementsContextBuilder = (contextValue: RequirementsContextValue | any): string => {
    // The second type is a hack to get around the fact that typescript doesn't allow overloading functions
    return `## Requirements so far
${contextValue}`;
};

const workflowDefinitionMessageBuilder = (contextValue: WorkflowDefinitionContextValue | any): string => {
    // The second type is a hack to get around the fact that typescript doesn't allow overloading functions
    if (!contextValue || !contextValue.workflowDescription) {
        logger.error('There was an error getting the workflow description.', {contextValue})
        return `## There was an error getting the workflow description.`
    }
    return `## Description of workflow User is referring to
${contextValue.workflowDescription}}`;
};

type contextTypeToTextFunctions = {
    [key in ContextType]: ((contextValue: AllowedContextValues) => string) | (() => string);
};

export const contextTypeToTextFunctions: contextTypeToTextFunctions = {
    REQUIREMENTS: requirementsContextBuilder,
    WORKFLOW_DEFINITION: workflowDefinitionMessageBuilder,
    WORKFLOW_RUN_INSTANCE: () => '',
};
