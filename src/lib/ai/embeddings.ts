import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

/**
 * Generates 1536-dimensional embeddings.
 * - Uses OpenAI `text-embedding-3-small` when OPENAI_API_KEY is configured.
 * - Falls back to Google Gemini Free Tier (`text-embedding-004` padded to 1536 dims) when GEMINI_API_KEY is set ($0 cost!).
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const cleanText = text.replace(/\n+/g, ' ').trim();
  if (!cleanText) {
    throw new Error('Cannot create embedding for empty text');
  }

  // Option A: Free Tier Google Gemini Embedding ($0 investment option)
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && (!openAiKey || openAiKey.startsWith('sk-proj-...'))) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: cleanText }] },
        }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const values: number[] = data?.embedding?.values || [];
      // Pad 768-dim vector to 1536-dim to match pgvector schema seamlessly
      if (values.length > 0 && values.length < 1536) {
        return [...values, ...new Array(1536 - values.length).fill(0)];
      }
      return values;
    }
  }

  // Option B: Standard OpenAI `text-embedding-3-small` (1536 dimensions)
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: cleanText,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Batch embedding generator for multiple text chunks
 */
export async function createBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const t of texts) {
    results.push(await createEmbedding(t));
  }
  return results;
}
