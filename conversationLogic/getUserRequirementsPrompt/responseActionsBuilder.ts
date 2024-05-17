// example of possibleResponseActions:
// [{\"responseActionKey\": \"RUN_FLOW\", \"responseActionDescription\": \"Assistant should run the flow that's in the current context\"}, {\"responseActionKey\": \"CREATE_FLOW\", \"responseActionDescription\": \"Assistant should create a flow based on the current flow requirements\"}, {\"responseActionKey\": \"CHANGE_FLOW\", \"responseActionDescription\": \"Assistant should change the flow in the current context to meet the user's new requirements\"}, {\"responseActionKey\": \"WAIT_FOR_CONFIRMATION\", \"responseActionDescription\": \"Wait for the user to confirm that they're ok performing an action.\"}]
// text that should be returned for a prompt:

// - Team should run the workflow that's in the current context, if there is any
// CREATE_AUTOMATED_WORKFLOW
// - Team should create a workflow based on the current flow requirements
// CHANGE_AUTOMATED_WORKFLOW
// - Team should change the workflow in the current context, if there is any, to meet the user's new requirements
// WAIT_FOR_CONFIRMATION
// - Team should wait for the user to confirm that they're ok performing an action.
// JUST_LISTEN
// - Team should wait for the automation guru to finish helping the user discover all their requirements

export type ResponseAction = {
    responseActionKey: string;
    responseActionDescription: string;
};

export const responseActionBuilder = (responseActions: ResponseAction[]): string => {
    const responseActionTexts = responseActions.map((responseAction) => {
        return `Key: ${responseAction.responseActionKey}
- ${responseAction.responseActionDescription}`;
    });
    const responseActionText = responseActionTexts.join('\n');
    return responseActionText;
};
