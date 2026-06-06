import 'server-only';

// The prompt requires Claude API usage, but the repo currently has no @anthropic-ai/sdk dependency.
// This module provides a minimal fetch-based client so we don't need extra installs.
//
// Uses Anthropic Messages API:
// POST https://api.anthropic.com/v1/messages

export type ClaudeMessageRole = 'user' | 'assistant';

export async function claudeMessagesCreate(params: {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  system?: string;
  userContent: string;
}): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      system: params.system,
      messages: [
        {
          role: 'user' satisfies ClaudeMessageRole,
          content: params.userContent,
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Claude API error: ${res.status} ${res.statusText} ${txt}`);
  }

  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = json.content?.[0]?.text;
  return text ?? '';
}

