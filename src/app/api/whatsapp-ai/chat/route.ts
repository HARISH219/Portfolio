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
  "You are 'WhatsApp AI', a friendly, concise assistant demoed inside Harish Bag's developer portfolio (harish.cyou).",
  "Harish is a developer and builder who ships web apps, automation, AI tools, and bots. His newest builds are WhatsApp AI and a Medicine App; he also builds Discord tools, a Minecraft server, automation tools, and a document manager.",
  "Reply the way a helpful WhatsApp assistant would: short, natural, and warm — usually 1–3 sentences.",
  "Detect the user's language and mirror it: reply in English for English, Hindi (Devanagari) for Hindi, and natural Hinglish (Roman script) when the user writes Hinglish.",
  "You may use light, tasteful emoji occasionally, like a real WhatsApp chat. Never overuse them.",
  "Gently promote Harish when it fits the conversation — never in a spammy or repetitive way. Answer the user's actual question first, then, when natural, add ONE light nudge: either invite them to contact/hire Harish, or point them to his work. Do this at most once every few messages.",
  "To contact Harish, tell them to use the 'Contact' section of this site (or the 'Let's talk' button) to send a message. To see his work, point them to the 'Projects' / 'Work' sections on this same site. Do not invent emails, phone numbers, or external links.",
  "If someone asks who built this / whose portfolio this is / about hiring or working together, enthusiastically introduce Harish and encourage them to reach out via the Contact section.",
  "Do not claim to be connected to a real WhatsApp account or to perform real-world actions (sending messages, setting real reminders). If asked to do such things, respond in-character but make clear it's a demo.",
  "Keep it safe and professional. This is a public portfolio demo.",
].join(" ");

type ClientMessage = { role: "user" | "ai"; text: string };

// Contextual, product-aware demo replies used when no live model is connected.
// These are intentionally varied so the "Interactive preview" feels intelligent
// instead of returning one canned line. This is NOT a real AI call — the UI
// labels it as an interactive preview.
function fallbackReply(text: string): string {
  const t = text.toLowerCase();

  // Greetings
  if (/\b(hi|hello|hey|yo|hola|namaste|namaskar)\b/i.test(t) || /नमस्ते|हाय/.test(text)) {
    return "Hey! 👋 How can I help you?";
  }
  if (/\b(kaise ho|kya haal|how are you|how's it going)\b/i.test(t)) {
    return "All good here! 😄 Ask me what I can do, or how the system works.";
  }

  // What is WhatsApp AI / what can you do
  if (/\bwhat('?s| is)?\b.*\b(whatsapp ai|this|you)\b/i.test(t) || /\bwhat can you do\b/i.test(t) || /\bwho are you\b/i.test(t)) {
    return "I'm a WhatsApp AI assistant. I can answer customer questions, explain products, share business information, and help automate repetitive WhatsApp conversations. 🙂";
  }

  // How does it work
  if (/\bhow\b.*\b(work|works|it work|does it)\b/i.test(t)) {
    return "A customer messages a business number → WhatsApp forwards it to a backend via webhook → the backend runs the message through an AI model → the reply is sent back to the customer. All in real time.";
  }

  // Why useful for businesses
  if (/\bwhy\b.*\b(useful|business|businesses|use it|good)\b/i.test(t) || /\bbenefit/i.test(t)) {
    return "Businesses get the same questions over and over on WhatsApp. This handles those automatically — 24/7 support, instant product answers, and lead capture — while keeping customers on the app they already use.";
  }

  // Own business number
  if (/\b(own|business|existing)\b.*\bnumber\b/i.test(t) || /\bconnect\b.*\bwhatsapp\b/i.test(t)) {
    return "Yes. The system is designed to connect to a business WhatsApp setup, so customers keep using the company's existing WhatsApp contact — no separate identity needed.";
  }

  // Languages
  if (/\b(language|hindi|hinglish|multilingual|spanish|french)\b/i.test(t)) {
    return "It can respond in the customer's language, so conversations feel natural — English, हिंदी, Hinglish, and more.";
  }

  // Human handoff
  if (/\b(human|agent|real person|handoff|escalate)\b/i.test(t)) {
    return "When a conversation needs a real person, it can escalate to a human — the AI handles the repetitive parts and hands off the rest.";
  }

  // Who built / hire
  if (/\b(who built|who made|hire|work with|collab|freelance)\b/i.test(t)) {
    return "This project was built by Harish. If you'd like to work together, the Contact section (or the 'Let's talk' button) is the best way to reach him. 🙌";
  }

  // Thanks / bye
  if (/\b(thanks|thank you|shukriya|bye|ok|okay)\b/i.test(t)) {
    return "Anytime! 🙂 Feel free to ask about how it works or how businesses can use it.";
  }

  // Default — still contextual and useful, not a dead-end.
  return "Good question! I can explain what WhatsApp AI does, how it works, why it's useful for businesses, or whether businesses can use their own number — just ask. 🙂";
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
    console.warn("[whatsapp-ai] GEMINI_API_KEY is not set — using fallback.");
    return NextResponse.json({
      reply: fallbackReply(lastUser),
      fallback: true,
      reason: "no-key",
    });
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
      // Upstream error — fall back rather than showing a broken chat. Log the
      // status + Google's error message (never the key) for debugging.
      let detail = "";
      try {
        const errBody = await res.json();
        detail = errBody?.error?.message ?? "";
      } catch {
        /* ignore parse errors */
      }
      console.error(`[whatsapp-ai] Gemini error ${res.status}: ${detail}`);
      return NextResponse.json(
        { reply: fallbackReply(lastUser), fallback: true, reason: `upstream-${res.status}` },
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
  } catch (err) {
    console.error("[whatsapp-ai] fetch threw:", err);
    return NextResponse.json(
      { reply: fallbackReply(lastUser), fallback: true, reason: "fetch-threw" },
      { status: 200 },
    );
  }
}
