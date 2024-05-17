import {
    EventBridgeClient,
    PutEventsCommand,
  } from "@aws-sdk/client-eventbridge";
  
  export const putEvents = async (
    source: string,
    detail: any,
    detailType: string,
    resources = [],
  ) => {
    const client = new EventBridgeClient({});
  
    const response = await client.send(
      new PutEventsCommand({
        Entries: [
          {
            Detail: JSON.stringify(detail),
            DetailType: detailType,
            Resources: resources,
            Source: source,
          },
        ],
      }),
    );
  
    return response;
};
