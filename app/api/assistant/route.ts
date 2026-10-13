import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { tools, resolveTool } from "@/lib/assistant/tools";
import { getSystem } from "@/lib/assistant/prompt";
import { ratelimit, budgetOk, recordUsage } from "@/lib/assistant/limits";

export const runtime = "nodejs";

const MODEL = process.env.ASSISTANT_MODEL ?? "claude-haiku-4-5-20251001";

const Body = z.object({
  path: z.string().max(200).default("/"),
  turnstileToken: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1500),
      })
    )
    .min(1)
    .max(14),
});

function sanitizeTopicCategory(text?: string): string {
  if (!text) return "general";
  const lower = text.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("kes") || lower.includes("usd")) return "pricing";
  if (lower.includes("service") || lower.includes("build") || lower.includes("app") || lower.includes("software")) return "services";
  if (lower.includes("time") || lower.includes("duration") || lower.includes("deadline") || lower.includes("sprint")) return "timeline";
  if (lower.includes("stack") || lower.includes("tech") || lower.includes("python") || lower.includes("react") || lower.includes("next")) return "tech_stack";
  if (lower.includes("security") || lower.includes("gdpr") || lower.includes("dpa") || lower.includes("compliance")) return "security";
  if (lower.includes("team") || lower.includes("nairobi") || lower.includes("office") || lower.includes("hiring")) return "company";
  return "unclassified_inquiry";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  // Rate limiting (20 / 10min, 60 / day)
  if (!(await ratelimit.limit(ip)).success) {
    return new Response("rate", { status: 429 });
  }

  // Daily token budget (ASSISTANT_DAILY_TOKENS)
  if (!(await budgetOk())) {
    return new Response("capped", { status: 503 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (
    !parsed.success ||
    parsed.data.messages.at(-1)?.role !== "user" ||
    parsed.data.messages[0].role !== "user"
  ) {
    return new Response("bad", { status: 400 });
  }

  // Optional Turnstile verification on session start
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && parsed.data.turnstileToken) {
    try {
      const formData = new FormData();
      formData.append("secret", turnstileSecret);
      formData.append("response", parsed.data.turnstileToken);
      formData.append("remoteip", ip);
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return new Response("turnstile", { status: 403 });
      }
    } catch (tsErr) {
      console.warn("[Assistant Turnstile] Verification warning:", tsErr);
    }
  }

  const system = await getSystem(parsed.data.path);
  const convo: Anthropic.MessageParam[] = parsed.data.messages.slice(-12).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const lastUserText = parsed.data.messages.filter((m) => m.role === "user").at(-1)?.content;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: object) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error("API key not configured");
        }

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        for (let turn = 0; turn < 3; turn++) {
          const s = client.messages.stream({
            model: MODEL,
            max_tokens: 600,
            system: system as any,
            tools: tools as any,
            messages: convo,
          });

          s.on("text", (t) => send({ type: "text", t }));
          const msg = await s.finalMessage();
          await recordUsage(msg.usage as any);

          if (msg.stop_reason !== "tool_use") break;

          convo.push({ role: "assistant", content: msg.content });
          const results = msg.content
            .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
            .map((tu) => {
              const ui = resolveTool(tu.name, tu.input);
              if (ui) {
                send({ type: "ui", ui });
                if (tu.name === "show_contact_form") {
                  // S12: log sanitized topic category only for weekly FAQ improvement
                  console.log("[Assistant Unanswered Query]", {
                    topic: sanitizeTopicCategory(lastUserText),
                    timestamp: new Date().toISOString(),
                  });
                }
              }
              return {
                type: "tool_result" as const,
                tool_use_id: tu.id,
                content: ui
                  ? "Shown to the visitor."
                  : "Invalid input. Use only routes from the sitemap.",
              };
            });
          convo.push({ role: "user", content: results });
        }
        send({ type: "done" });
      } catch (err) {
        console.warn("[Assistant Stream Error]", err);
        send({ type: "error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
    },
  });
}
