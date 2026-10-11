"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContact } from "@/app/actions/submit-contact";
import { services } from "@/data/services";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  project_type: z.string(),
  budget: z.string(),
  message: z.string().min(10, "Please briefly describe your project"),
  consent: z.boolean().refine(val => val === true, "Consent is required"),
});

type FormValues = z.infer<typeof contactSchema>;

type FormState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
};

const initialState: FormState = { status: "idle", message: "" };

export default function ContactSection() {
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      project_type: "Not sure yet",
      budget: "Not sure yet",
    }
  });

  const onSubmit = (data: FormValues) => {
    // Convert React Hook Form data back to FormData for the Server Action
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    startTransition(async () => {
      setState({ status: "loading", message: "" });
      const result = await submitContact(formData);
      if (result.status === "success") {
        reset();
      }
      setState(result);
    });
  };

  if (state.status === "success") {
    return (
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            Message sent!
          </h2>
          <p className="text-gray-500 text-base">{state.message}</p>
          <button
            onClick={() => setState(initialState)}
            className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-emerald-700"
          >
            Send another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Get In Touch
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Start a Project
          </h2>
          <p className="text-gray-500 text-base">
            Tell me what you are trying to build. I&apos;ll get back to you within
            24 hours.
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 sm:p-10 border border-gray-100">
          {state.status === "error" && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {state.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Jane Doe"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow ${
                    errors.name ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="jane@example.com"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What do you need?
                </label>
                <select
                  {...register("project_type")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow"
                >
                  <option>Not sure yet</option>
                  {services.map(s => <option key={s.slug} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Budget range
                </label>
                <select
                  {...register("budget")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow"
                >
                  {["Prefer not to say","Not sure yet","Under $10k","$10k – $25k","$25k – $50k","Over $50k"].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                What are you building? <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("message")}
                rows={4}
                placeholder="Briefly describe your project, timeline, and goals..."
                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition-shadow resize-none ${
                  errors.message ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("consent")}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  I agree you may store these details to respond. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consent && <p className="mt-1 text-xs text-red-500 ml-7">{errors.consent.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending || state.status === "loading"}
              className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-700"
            >
              {isPending || state.status === "loading" ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
