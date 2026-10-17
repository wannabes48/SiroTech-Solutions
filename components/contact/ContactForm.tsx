"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { services } from "@/data/services";
import { Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/TurnstileWidget";

const budgetOptions = {
  KES: [
    { label: "Under KSh 30,000 (Simple Landing Page)", value: "under_30k_kes" },
    { label: "KSh 30,000 – 60,000 (Small Business Website)", value: "30k_60k_kes" },
    { label: "KSh 70,000 – 150,000 (Custom Web App / eCommerce)", value: "70k_150k_kes" },
    { label: "KSh 150,000 – 300,000+ (Corporate / Enterprise Platform)", value: "150k_300k_kes" },
    { label: "Over KSh 300,000 (Complex Multi-Module Platform)", value: "over_300k_kes" },
    { label: "Not sure / Seeking scoping advice", value: "not_sure_kes" },
  ],
  USD: [
    { label: "Under $250 (Simple Landing Page)", value: "under_250_usd" },
    { label: "From $250 – $500 (Small Business Website)", value: "250_500_usd" },
    { label: "From $550 – $1,200 (Custom Web App / eCommerce)", value: "550_1200_usd" },
    { label: "From $1,200 – $2,500+ (Corporate / Enterprise Platform)", value: "1200_2500_usd" },
    { label: "Over $2,500 (Complex Multi-Module Platform)", value: "over_2500_usd" },
    { label: "Not sure / Seeking scoping advice", value: "not_sure_usd" },
  ],
};

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  email: z.string().email("Please enter a valid work email address"),
  phone: z.string().optional(),
  need: z.string().min(1, "Please select what you need"),
  budget: z.string().min(1, "Please select an estimated budget"),
  message: z.string().min(10, "Please provide at least 10 characters describing your project goals"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to our data handling policy to proceed",
  }),
  turnstileToken: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  // Determine prefilled need from query parameters (?service=... or ?plan=...)
  const serviceParam = searchParams.get("service") || searchParams.get("package");
  const planParam = searchParams.get("plan");

  const getInitialNeed = (): string => {
    if (planParam) {
      if (planParam.toLowerCase().includes("launch")) return "Simple Landing Page / Brochure Site";
      if (planParam.toLowerCase().includes("growth")) return "Custom Web Application / eCommerce";
      if (planParam.toLowerCase().includes("scale")) return "Large Corporate / Enterprise Platform";
    }
    if (serviceParam) {
      const match = services.find(
        (s) => s.slug === serviceParam || s.slug.includes(serviceParam)
      );
      if (match) return match.title;
      if (serviceParam.includes("landing")) return "Simple Landing Page / Brochure Site";
      if (serviceParam.includes("business")) return "Standard Small Business Website";
      if (serviceParam.includes("app") || serviceParam.includes("ecommerce"))
        return "Custom Web Application / eCommerce";
    }
    return "Web application development";
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur", // Inline validation on blur
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      need: getInitialNeed(),
      budget: "70k_150k_kes",
      message: "",
      consent: true,
    },
  });

  // Update prefilled value when query params hydrate
  useEffect(() => {
    const initial = getInitialNeed();
    if (initial) {
      setValue("need", initial);
    }
  }, [serviceParam, planParam, setValue]);

  const onSubmit = async (data: ContactFormValues) => {
    if (isSubmitting) return; // Prevent double submit

    // Check Turnstile token before dispatch
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFX3BNw6jU9raPz4";
    if (siteKey && !turnstileToken) {
      setServerError("Please complete the Cloudflare security verification challenge below before submitting.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          turnstileToken,
          "cf-turnstile-response": turnstileToken,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Successful submission -> redirect to thank-you page
        router.push("/thank-you?ref=contact");
      } else {
        setServerError(
          result.error ||
            "Unable to deliver your message. Please try again or email hello@sirotech.com directly."
        );
        setIsSubmitting(false);
        // Single-use token: reset Turnstile on rejection so user can retry cleanly
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }
    } catch (err) {
      // Network failure: retain form data and show fallback retry message
      setServerError(
        "Network connection interrupted. Your form data has been preserved. Please click submit again or email hello@sirotech.com directly."
      );
      setIsSubmitting(false);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <div className="bg-surface rounded-[28px] p-7 sm:p-10 border border-rule shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-2">Project Brief Form</h2>
        <p className="text-xs sm:text-sm text-body">
          Fill out the details below. We review every brief and return an architectural recommendation within 24 hours.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Row 1: Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Jane Doe"
              className={`w-full bg-bg border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-all ${
                errors.name ? "border-rose-400 focus:border-rose-500" : "border-rule focus:border-sage-700"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Company / Organization
            </label>
            <input
              {...register("company")}
              type="text"
              placeholder="e.g. Acme Health or Early Startup"
              className="w-full bg-bg border border-rule rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-500/20 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Work Email & Phone / WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="jane@company.com"
              className={`w-full bg-bg border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-all ${
                errors.email ? "border-rose-400 focus:border-rose-500" : "border-rule focus:border-sage-700"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              Phone / WhatsApp Number
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+254 700 000 000"
              className="w-full bg-bg border border-rule rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-500/20 transition-all"
            />
          </div>
        </div>

        {/* Row 3: What you need & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
              What do you need? <span className="text-rose-500">*</span>
            </label>
            <select
              {...register("need")}
              className="w-full bg-bg border border-rule rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-500/20 transition-all cursor-pointer"
            >
              <option value="Web application development">Web Application Development</option>
              <option value="Custom software engineering">Custom Software Engineering</option>
              <option value="Mobile app development">Mobile App Development (iOS/Android)</option>
              <option value="AI & automation workflows">AI &amp; Automation Workflows</option>
              <option value="Cloud architecture & DevOps">Cloud Architecture &amp; DevOps</option>
              <option value="FinTech & M-Pesa payments">FinTech &amp; M-Pesa Integration</option>
              <option value="Simple Landing Page / Brochure Site">Simple Landing Page / Brochure Site</option>
              <option value="Standard Small Business Website">Standard Small Business Website</option>
              <option value="Large Corporate / Enterprise Platform">Large Corporate / Enterprise Platform</option>
              <option value="Not sure / Multiple requirements">Not sure yet / Multiple services</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink">
                Estimated Budget <span className="text-rose-500">*</span>
              </label>
              {/* Currency Toggle for Budget Options */}
              <div className="inline-flex bg-bg rounded-full p-0.5 border border-rule text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency("KES")}
                  className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                    currency === "KES" ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  KES
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                    currency === "USD" ? "bg-ink text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            <select
              {...register("budget")}
              className="w-full bg-bg border border-rule rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-sage-700 focus:ring-2 focus:ring-sage-500/20 transition-all cursor-pointer"
            >
              {budgetOptions[currency].map((opt) => (
                <option key={opt.value} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
            Project Description &amp; Objectives <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register("message")}
            rows={5}
            placeholder="Tell us about the problem you are solving, core user workflows, existing tech stack, and ideal timeline..."
            className={`w-full bg-bg border rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage-500/20 transition-all resize-none leading-relaxed ${
              errors.message ? "border-rose-400 focus:border-rose-500" : "border-rule focus:border-sage-700"
            }`}
          />
          {errors.message && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.message.message}</p>
          )}
        </div>

        {/* Cloudflare Turnstile Challenge Widget */}
        <div className="py-2">
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFX3BNw6jU9raPz4"}
            action="contact"
            theme="auto"
            onVerify={(token) => {
              setTurnstileToken(token);
              if (serverError && serverError.includes("security verification")) {
                setServerError(null);
              }
            }}
            onExpire={() => setTurnstileToken(null)}
            onError={(err) => {
              console.warn("Turnstile challenge warning:", err);
            }}
          />
        </div>

        {/* Turnstile Trust Badge Notice */}
        <div className="flex items-center gap-2 text-[11px] text-muted bg-bg/80 p-3 rounded-xl border border-rule">
          <ShieldCheck className="w-4 h-4 text-sage-700 shrink-0" />
          <span>Protected by Cloudflare Turnstile &amp; Kenya DPA (2019) encryption standards.</span>
        </div>

        {/* Consent Checkbox */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("consent")}
              className="mt-1 w-4 h-4 text-sage-700 border-rule rounded focus:ring-sage-500 cursor-pointer"
            />
            <span className="text-xs text-body leading-relaxed">
              I agree that SiroTech Solutions may process my personal and business contact details to prepare a technical proposal and communicate regarding this project.
            </span>
          </label>
          {errors.consent && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium ml-7">{errors.consent.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-sage-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying &amp; Submitting Brief...</span>
            </>
          ) : (
            <>
              <span>Submit Project Brief</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
