import type { Metadata } from "next";
import { GlobalStandardsSection } from "@/components/marketing/GlobalStandardsSection";

export const metadata: Metadata = {
  title: "How We Work — EIS",
  description: "Standards we align with and how we work with you.",
};

export default function AboutPage() {
  return (
    <div className="page-container pb-28">
      <GlobalStandardsSection />
    </div>
  );
}
