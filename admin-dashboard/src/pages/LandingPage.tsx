import React from "react";
import { Box } from "@mui/material";
import { HeroSection } from "../landing/sections/HeroSection";
import { DownloadSection } from "../landing/sections/DownloadSection";
import { TestimonialsSection } from "../landing/sections/TestimonialsSection";
import { FooterSection } from "../landing/sections/FooterSection";
import SEOHead from "../components/SEOHead";
import StructuredData from "../components/StructuredData";
import { HOME_SEO } from "../seo/metadata";
import LandingNavbar from "../landing/components/LandingNavbar";
import { HowItWorksSection } from "../landing/sections/HowItWorksSection";
import { FAQSection } from "../landing/sections/FAQSection";
import { JoinFamilySection } from "../landing/sections/JoinFamilySection";

const LandingPage: React.FC = () => {
  return (
    <>
      <SEOHead {...HOME_SEO} />
      <StructuredData type="all" />
      <LandingNavbar />
      <Box component="main" id="main" tabIndex={-1} dir="rtl" sx={{ overflowX: "hidden" }}>
        <HeroSection />
        <HowItWorksSection />
        <FAQSection />
        <JoinFamilySection />
        <DownloadSection />
        <TestimonialsSection />
        <FooterSection />
      </Box>
    </>
  );
};

export default LandingPage;
