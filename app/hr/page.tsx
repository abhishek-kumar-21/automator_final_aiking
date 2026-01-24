"use client";
import HRNavbar from "@/components/hr/HRNavbar";
import HRHeroSection from "@/components/hr/HRHeroSection";
import HRFeaturesSection from "@/components/hr/HRFeaturesSection";
import HRFAQSection from "@/components/hr/HRFAQSection";
import HRCompaniesSection from "@/components/hr/HRCompaniesSection";
import HRHowItWorksSection from "@/components/hr/HRHowItWorks";
import HRResumeATSChecker from "@/components/hr/HRResumeATSChecker";
import HRTestimonialSection from "@/components/hr/HRTestimonialSection";
import HRVideoSection from "@/components/hr/HRVideoSection";
import HRSequenceSection from "@/components/hr/HRSequenceSection";
import JobSeeker from "@/components/Jobseeker";
import PricingSection from "@/components/hr/pricing";
import WhatsAppButton from "@/components/WhatsAppButton";
import HowItWorks from "@/components/home/HowItWorks";
import TestimonialSection from "@/components/home/TestimonialSection";
import ResumeATSChecker from "@/components/home/ResumeATSChecker";
import FAQSection from "@/components/home/FAQSection";

export default function HRPage() {
  return (
    <div className="min-h-screen bg-white">
      <HRNavbar />
      <HRHeroSection />
      {/* <HRVideoSection /> */}
      <HRCompaniesSection />
      <HRSequenceSection />
      {/* <HRHowItWorksSection /> */}
      <HRFeaturesSection />
      <HowItWorks/>
      <PricingSection />
      <TestimonialSection />
      <ResumeATSChecker />
      <FAQSection />
      <JobSeeker />
      <WhatsAppButton />
    </div>
  );
}