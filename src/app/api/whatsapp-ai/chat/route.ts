import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// POST /api/whatsapp-ai/chat
// A thin, secure proxy to Google Gemini for the WhatsApp AI demo. The API key
// is read from process.env.GEMINI_API_KEY and never leaves the server.
//
// Request body:  { messages: { role: "user" | "ai"; text: string }[] }
// Response body: { reply: string, fallback?: boolean }
//
// If no key is configured, responds with a friendly fallback reply so the demo
// still works (clearly flagged with `fallback: true`).
// -----------------------------------------------------------------------------

export const runtime = "edge";

const MODEL = "gemini-1.5-flash";
const MAX_MESSAGES = 20; // cap history sent upstream
const MAX_CHARS = 1000; // per-message length cap

const SYSTEM_PROMPT = [
  "You are 'WhatsApp AI', a friendly, concise assistant demoed inside Harish Bag's developer portfolio.",
  "Reply the way a helpful WhatsApp assistant would: short, natural, and warm — usually 1–3 sentences.",
  "Detect the user's language and mirror it: reply in English for English, Hindi (Devanagari) for Hindi, and natural Hinglish (Roman script) when the user writes Hinglish.",
  "You may use light, tasteful emoji occasionally, like a real WhatsApp chat. Never overuse them.",
  "Do not claim to be connected to a real WhatsApp account or to perform real-world actions (sending messages, setting real reminders). If asked to do such things, respond in-character but make clear it's a demo.",
  "Keep it safe and professional. This is a public portfolio demo.",
].join(" ");

type ClientMessage = { role: "user" | "ai"; text: string };

function fallbackReply(text: string): string {
  const t = text.toLowerCase();
  // A tiny deterministic responder so the demo works without a key.
  if (/\b(hi|hello|hey|namaste|namaskar)\b/i.test(t) || /नमस्ते/.test(text)) {
    return "Hey! 👋 I'm WhatsApp AI — this is a demo running without a live model right now. Ask me anything!";
  }
  if (/\b(kaise ho|kya haal|how are you)\b/i.test(t)) {
    return "Main badhiya hoon, aap sunao! 😄 (Demo mode — connect a Gemini key for full replies.)";
  }
  return "Thanks for the message! I'm running in demo mode right now, so replies are limited. Add a Gemini API key to enable full AI responses. 🙂";
}

export async function POST(req: Request) {
  let body: { messages?: ClientMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  // Sanitize + clamp the history.
  const clean = messages
    .filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "ai"))
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_CHARS) }));

  const lastUser = [...clean].reverse().find((m) => m.role === "user")?.text ?? "";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key configured — graceful, clearly-flagged fallback.
    return NextResponse.json({ reply: fallbackReply(lastUser), fallback: true });
  }

  // Map our history to Gemini's `contents` format (user | model roles).
  const contents = clean.map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
          topP: 0.95,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
    });

    if (!res.ok) {
      // Upstream error — fall back rather than showing a broken chat.
      return NextResponse.json(
        { reply: fallbackReply(lastUser), fallback: true },
        { status: 200 },
      );
    }

    const data = await res.json();
    const reply: string | undefined =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim();

    if (!reply) {
      return NextResponse.json(
        { reply: "Hmm, I couldn't come up with a reply just now — try rephrasing?", fallback: true },
        { status: 200 },
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: fallbackReply(lastUser), fallback: true },
      { status: 200 },
    );
  }
}
