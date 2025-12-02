"use client";
import { Workflow, Github, Twitter, Linkedin } from "lucide-react";
import { Footer as AnimatedFooter } from "@/components/ui/modem-animated-footer";

export default function Footer() {
  const socialLinks = [
    {
      icon: <Github className="w-6 h-6" />,
      href: "https://github.com/yourusername/flowkit",
      label: "GitHub",
    },
    {
      icon: <Twitter className="w-6 h-6" />,
      href: "https://twitter.com/flowkit",
      label: "Twitter",
    },
    {
      icon: <Linkedin className="w-6 h-6" />,
      href: "https://linkedin.com/company/flowkit",
      label: "LinkedIn",
    },
  ];

  const navLinks = [
    { label: "Workflows", href: "/workflows" },
    { label: "AI Builder", href: "/ai-builder" },
    { label: "Categories", href: "/workflows" },
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ];

  return (
    <AnimatedFooter
      brandName="FlowKit"
      brandDescription="Production-ready automation workflows for modern teams. Built by developers, for developers."
      socialLinks={socialLinks}
      navLinks={navLinks}
      brandIcon={
        <Workflow className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />
      }
    />
  );
}
