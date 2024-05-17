export type ConversationLambdaEnvironmentVariables = {
    OPENAI_API_KEY_SECRET_NAME: string;
    GEMINI_API_KEY_SECRET_NAME: string;
    ANTHROPIC_API_KEY_SECRET_NAME: string;
    AWS_REGION: string;
    BOT_RESPONSE_MESSAGE_EVENT_SOURCE: string;
    BOT_RESPONSE_MESSAGE_EVENT_DETAIL_TYPE: string;
};

export class EnvironmentVariableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentVariableError';
    }
}

export const validateEnvironmentVariables = (): ConversationLambdaEnvironmentVariables => {
    if (!process.env.OPENAI_API_KEY_SECRET_NAME) {
        throw new EnvironmentVariableError('OPENAI_API_KEY_SECRET_NAME is required');
    }
    if (!process.env.GEMINI_API_KEY_SECRET_NAME) {
        throw new EnvironmentVariableError('GEMINI_API_KEY_SECRET_NAME is required');
    }
    if (!process.env.ANTHROPIC_API_KEY_SECRET_NAME) {
        throw new EnvironmentVariableError('ANTHROPIC_API_KEY_SECRET_NAME is required');
    }
    if (!process.env.AWS_REGION) {
        throw new EnvironmentVariableError('AWS_REGION is required');
    }
    if (!process.env.BOT_RESPONSE_MESSAGE_EVENT_SOURCE) {
        throw new EnvironmentVariableError('BOT_RESPONSE_MESSAGE_EVENT_SOURCE is required');
    }
    if (!process.env.BOT_RESPONSE_MESSAGE_EVENT_DETAIL_TYPE) {
        throw new EnvironmentVariableError('BOT_RESPONSE_MESSAGE_EVENT_DETAIL_TYPE is required');
    }

    return process.env as ConversationLambdaEnvironmentVariables;
};
