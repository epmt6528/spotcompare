import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnalysisResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  let body: { placeName: string; reviews: { text: string; rating?: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { placeName, reviews } = body;
  if (!placeName || !Array.isArray(reviews)) {
    return NextResponse.json(
      { error: "placeName and reviews (array) required" },
      { status: 400 }
    );
  }

  const reviewTexts = reviews
    .filter((r) => r.text && r.text.trim())
    .map((r) => r.text.trim());
  if (reviewTexts.length === 0) {
    return NextResponse.json({
      pros: ["No review text available."],
      cons: [],
    } satisfies AnalysisResult);
  }

  const prompt = `Analyze the following Google reviews for "${placeName}" and extract structured pros and cons.
Return a JSON object with "pros" (array of strings) and "cons" (array of strings).
Be concise; 3-6 items each. Base only on review content. If a review has no clear pros or cons, omit or generalize.

Reviews:
${reviewTexts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n")}`;

  const client = new OpenAI({ apiKey: key });
  let completion;
  try {
    completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: unknown) {
    const status = err instanceof OpenAI.APIError ? err.status ?? 500 : 500;
    const msg = err instanceof Error ? err.message : "OpenAI API error";
    return NextResponse.json({ error: msg }, { status });
  }

  let text = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) text = jsonMatch[1].trim();
  let result: AnalysisResult;
  try {
    const parsed = JSON.parse(text) as AnalysisResult;
    result = {
      pros: Array.isArray(parsed.pros) ? parsed.pros : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons : [],
    };
  } catch {
    result = { pros: [], cons: [] };
  }
  return NextResponse.json(result);
}
