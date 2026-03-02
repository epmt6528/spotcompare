import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
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

  const client = new Anthropic({ apiKey: key });
  const message = await client.messages.create({
    max_tokens: 1024,
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: prompt }],
  });

  let text =
    message.content[0].type === "text"
      ? message.content[0].text
      : "";
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
