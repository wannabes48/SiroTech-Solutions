import Footer from "@/components/layout/Footer";
import AssistantWidget from "@/components/assistant/AssistantWidget";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
      <AssistantWidget />
    </>
  );
}
