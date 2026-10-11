"use server";

// ─── Types ───────────────────────────────────────────────────────────────────
type ActionResult = {
  status: "success" | "error";
  message: string;
};

// ─── Server Action ────────────────────────────────────────────────────────────
// Database integration is temporarily disabled.
// To enable Supabase persistence later:
//   1. npm install @supabase/supabase-js
//   2. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
//   3. Uncomment the Supabase block below
export async function submitContact(
  formData: FormData
): Promise<ActionResult> {
  const name    = formData.get("name")?.toString().trim()    ?? "";
  const email   = formData.get("email")?.toString().trim()   ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  // Server-side validation
  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // ── Log submission to console (dev mode) ──────────────────────────────────
  console.log("[Contact Submission]", {
    name,
    email,
    project_type: formData.get("project_type"),
    budget:       formData.get("budget"),
    message,
    submitted_at: new Date().toISOString(),
  });

  // ── Supabase persistence (uncomment when ready) ───────────────────────────
  // import { supabase } from "@/lib/supabase";
  // const { error } = await supabase!.from("contact_submissions").insert([
  //   { name, email, project_type, budget, message },
  // ]);
  // if (error) {
  //   console.error("[submitContact] Supabase error:", error.message);
  //   return { status: "error", message: "Something went wrong. Please try again later." };
  // }

  return {
    status: "success",
    message:
      "Thanks for reaching out! I'll review your message and get back to you within 24 hours.",
  };
}
