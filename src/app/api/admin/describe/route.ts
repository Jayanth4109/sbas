import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { name, notes } = await req.json().catch(() => ({}));
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI description is not configured" }, { status: 500 });
  }

  const prompt = `You write short product descriptions for the storefront of an Ayurvedic pharmacy in India. The shop owner gave you a product name and, optionally, a few rough notes. Write one warm, trustworthy, plain-language description of 2-3 sentences, suitable for customers browsing on a phone. Do not invent medical claims, dosages, or ingredients that were not mentioned. Do not use markdown. Do not include the price.

Product name: ${name}
Owner's notes: ${notes?.trim() || "(none given)"}

Description:`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Anthropic API error", response.status, detail);
    return NextResponse.json({ error: "Could not generate a description right now" }, { status: 502 });
  }

  const data = await response.json();
  const description = data.content?.[0]?.text?.trim() ?? "";
  return NextResponse.json({ description });
}
