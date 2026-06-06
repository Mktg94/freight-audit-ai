import 'server-only';

export async function geminiGenerateText(params: {
  system?: string;
  userContent: string;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const parts: { text: string }[] = [];
  if (params.system) {
    parts.push({ text: `[SYSTEM INSTRUCTION]\n${params.system}\n\n[USER QUERY]` });
  }
  parts.push({ text: params.userContent });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: params.temperature ?? 0,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Gemini API error: ${res.status} ${txt}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ?? '';
}
