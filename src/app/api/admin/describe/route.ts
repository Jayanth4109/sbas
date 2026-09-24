import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";

const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";

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
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("OpenRouter API error", response.status, detail);
    return NextResponse.json({ error: "Could not generate a description right now" }, { status: 502 });
  }

  const data = await response.json();
  const description = data.choices?.[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ description });
}
