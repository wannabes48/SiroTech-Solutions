import { CtaBand } from "@/components/ui/CtaBand";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-bg border-t border-rule">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-10">
        <CtaBand
          headline="Tell us what you're trying to build."
          description="Whether you need a custom web platform, a mobile application, or a scalable AI integration, our engineering team is ready to execute."
          primaryAction={{
            label: "Start a Project",
            href: "/contact",
          }}
          secondaryAction={{
            label: "Book a Consultation",
            href: "/book",
          }}
        />
      </div>
    </section>
  );
}
