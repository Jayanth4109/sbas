import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";

// Free-tier models get rate-limited by their upstream provider fairly often.
// OpenRouter tries these in order and falls through automatically if one is
// unavailable (max 3 per request). Picked from different providers so one
// provider's congestion doesn't take the whole thing down.
// https://openrouter.ai/docs/features/model-routing
const FALLBACK_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "liquid/lfm-2.5-2.6b:free",
];

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { name, notes } = await req.json().catch(() => ({}));
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI description is not configured" }, { status: 500 });
  }

  const prompt = `You write short product descriptions for the storefront of an Ayurvedic pharmacy in India. The shop owner gave you a product name and, optionally, a few rough notes. Write one warm, trustworthy, plain-language description of 2-3 sentences, suitable for customers browsing on a phone. Do not invent medical claims, dosages, or ingredients that were not mentioned. Do not use markdown. Do not include the price. Reply with only the description, nothing else.

Product name: ${name}
Owner's notes: ${notes?.trim() || "(none given)"}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      models: process.env.OPENROUTER_MODEL
        ? [process.env.OPENROUTER_MODEL, ...FALLBACK_MODELS].slice(0, 3)
        : FALLBACK_MODELS,
      // Some free models spend their token budget on hidden "reasoning"
      // before writing the actual answer, so this needs headroom beyond
      // what a 2-3 sentence description would normally take.
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("OpenRouter API error", response.status, detail);
    return NextResponse.json({ error: "Could not generate a description right now" }, { status: 502 });
  }

  const data = await response.json();
  const description = data.choices?.[0]?.message?.content?.trim();
  if (!description) {
    console.error("OpenRouter returned no content", JSON.stringify(data));
    return NextResponse.json({ error: "Could not generate a description right now" }, { status: 502 });
  }
  return NextResponse.json({ description });
}
