import {
    BodyJSONParseError,
    RequestBodyValidationError,
    getRequestBody,
    NewUserMessageEvent,
} from './lambdaInterface/eventInterface';
import { getSecrets } from './secrets/getSecrets';
import { ChatPromptCreationError, requirementsExtractionAnthropicSonnet, requirementsExtractionGemin1_0, requirementsExtractionGemini1_5 } from './conversationLogic/requirementsExtraction';
import { convertBotResponseToFunctionResponse } from './lambdaInterface/convertBotResponseToFunctionResponse';
import { EnvironmentVariableError, validateEnvironmentVariables } from './lambdaInterface/validateEnvironmentVariables';
import { FlowGuideBuildFlowConversationBotResponse, FlowGuideBuildFlowConversationErrorResponse } from './backendApi/flowGuideBuildFlowConversations';
import { putEvents } from './lambdaInterface/sendEventBridgeMessage';

import middy from '@middy/core';
import inputOutputLogger from '@middy/input-output-logger';
import logger from './logger';

const noRetryErrors = [
    BodyJSONParseError,
    EnvironmentVariableError,
    RequestBodyValidationError,
    ChatPromptCreationError,
];

const runConversationLogic = async (event: NewUserMessageEvent): Promise<void> => {
    const environment = validateEnvironmentVariables();

    try {
        logger.debug('getting request body');
        const requestBody = getRequestBody(event);

        logger.debug('getting secrets');
        const { openAiKey, geminiKey, anthropicKey } = await getSecrets(environment.AWS_REGION, environment.OPENAI_API_KEY_SECRET_NAME, environment.GEMINI_API_KEY_SECRET_NAME, environment.ANTHROPIC_API_KEY_SECRET_NAME);

        logger.debug('extracting requirements');
        // const botRequirementsExtractionResponse = await requirementsExtractionOpenai(
        //     openAiKey,
        //     requestBody.messageHistory,
        //     requestBody.extraContext,
        //     requestBody.possibleResponseActions,
        // );
        // const botRequirementsExtractionResponse = await requirementsExtractionGemin1_0(
        //     geminiKey,
        //     requestBody.messageHistory,
        //     requestBody.extraContext,
        //     requestBody.possibleResponseActions,
        // )
        const botRequirementsExtractionResponse = await requirementsExtractionAnthropicSonnet(
            anthropicKey,
            requestBody.messageHistory,
            requestBody.extraContext,
            requestBody.possibleResponseActions,
        )

        logger.debug('converting bot response to function response');
        const response: FlowGuideBuildFlowConversationBotResponse = convertBotResponseToFunctionResponse(
            requestBody,
            botRequirementsExtractionResponse,
        );
        
        logger.info('sending bot response message', {response: {...response, authorization: 'REDACTED'}});
        await putEvents(environment.BOT_RESPONSE_MESSAGE_EVENT_SOURCE, response, environment.BOT_RESPONSE_MESSAGE_EVENT_DETAIL_TYPE)

        return;
    } catch (error: any) {
        logger.info('error', {error, errorName: error.name, noRetryErrors});
        if (noRetryErrors.map((errorClass) => error instanceof errorClass).includes(true)) {
            logger.info('error is not retryable');
            const eventMessage: FlowGuideBuildFlowConversationErrorResponse = {
                error: error.message,
                errorType: error.name,
                messageBody: JSON.stringify(event.detail),
            };

            logger.info('sending bot response message', {response: {...eventMessage}});
            await putEvents(environment.BOT_RESPONSE_MESSAGE_EVENT_SOURCE, eventMessage, environment.BOT_RESPONSE_MESSAGE_EVENT_DETAIL_TYPE)
            return;
        }

        logger.info('error is retryable, throwing');
        throw error;
    }
};

const baseHandler = async (event: any): Promise<void> => {
    return await runConversationLogic(event);
}

export const handler = middy()
  .use(
    inputOutputLogger({
      logger: (request) => logger.info('Request', request),
      awsContext: true,
      omitPaths: ['event.detail.authorization']
    })
  ).handler(baseHandler);