import { extractJsonObject } from "@/lib/json";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function generateJson(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it locally and in Vercel project environment variables.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
          maxOutputTokens: 2048
        }
      })
    }
  );

  const responseText = await response.text();
  let payload: GeminiResponse;

  try {
    payload = responseText ? (JSON.parse(responseText) as GeminiResponse) : {};
  } catch {
    throw new Error(
      `Gemini returned a non-JSON response (${response.status}). Check the API key and model access.`
    );
  }

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini request failed with status ${response.status}.`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) {
    throw new Error("Gemini returned an empty model response.");
  }

  try {
    return extractJsonObject(text);
  } catch {
    throw new Error("Gemini returned malformed JSON. Please regenerate the brief.");
  }
}

export { MODEL as GEMINI_MODEL };
