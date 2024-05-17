import { SecretsManagerClient, GetSecretValueCommand, GetSecretValueCommandInput, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';

export interface Secrets {
    openAiKey: string;
    geminiKey: string;
    anthropicKey: string;
}

const getSecret = async (client: SecretsManagerClient, secretName: string): Promise<string> => {
    let response;
    try {
        response = await client.send<GetSecretValueCommandInput, GetSecretValueCommandOutput>(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
            }) as any
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    const secret = response.SecretString;
    if (secret === undefined) {
        throw new Error(`Could not retrieve secret ${secretName}`);
    }
    if (typeof secret !== 'string') {
        throw new Error(`${secretName} is not a string`);
    }

    return secret;
}

export const getSecrets = async (region: string, openaiSecretName: string, geminiSecretName: string, anthropicSecretName: string): Promise<Secrets> => {
    // Use this code snippet in your app.
    // If you need more information about configurations or implementing the sample code, visit the AWS docs:
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

    const client = new SecretsManagerClient({
        region: region,
    });

    const secretCalls = [getSecret(client, openaiSecretName), getSecret(client, geminiSecretName), getSecret(client, anthropicSecretName)]
    const [openAiKey, geminiKey, anthropicKey] = await Promise.all(secretCalls);

    return {
        openAiKey,
        geminiKey,
        anthropicKey
    };
};
