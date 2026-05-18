export function extractJsonObject(value: string) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not include a JSON object.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

export function stringifyForPrompt(value: unknown) {
  return JSON.stringify(value, null, 2);
}
