import OpenAI from 'openai';

const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';

export function getAIClient(): OpenAI {
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
        throw new Error('NVIDIA_API_KEY is not configured');
    }

    return new OpenAI({
        apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });
}

export function getAIModel(): string {
    return process.env.NVIDIA_AI_MODEL || DEFAULT_MODEL;
}
