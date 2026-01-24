/** @format */
"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const footerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Get dynamic year
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "instagram", color: "hover:text-white", link: "https://www.instagram.com/jobform.automator_offical" },
    { name: "facebook", color: "hover:text-white", link: "https://www.facebook.com/people/Job-Tips/61556365446390/" },
    { name: "linkedin", color: "hover:text-white", link: "https://www.linkedin.com/company/aikingsolutions/posts/?feedView=all" },
    { name: "youtube", color: "hover:text-white", link: "https://www.youtube.com/@JobFormAutomator" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white w-full px-4 sm:px-6 lg:px-8 pb-8 pt-2">
      <footer
        ref={footerRef}
        className={`bg-[#18181B] text-white py-12 sm:py-16 px-6 sm:px-12 rounded-[30px] sm:rounded-[48px] max-w-[1440px] mx-auto transition-all duration-700 ease-in-out transform ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            
            {/* Column 1: Brand & Contact Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-wide">
                Jobform Automator
              </h2>

              {/* Social Icons */}
              <div className="flex space-x-5">
                {socialLinks.map(({ name, color, link }) => (
                  <a
                    key={name}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition-colors duration-200 ${color}`}
                  >
                    {name === "instagram" && <FaInstagram size={20} />}
                    {name === "facebook" && <FaFacebook size={20} />}
                    {name === "linkedin" && <FaLinkedin size={20} />}
                    {name === "youtube" && <FaYoutube size={20} />}
                  </a>
                ))}
              </div>

              {/* Contact Details */}
              <div className="text-sm text-gray-400 space-y-1">
                <p>+91 9766116839</p>
                <p>contact@jobformautomator.com</p>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <FooterLink href="/hr" text="Home" />
                <FooterLink href="/hr/aboutUs" text="About" />
                <FooterLink href="/hr/pricing" text="Pricing" />
              </ul>
            </div>

            {/* Column 3: Features */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Features</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <FooterLink href="/hr/resumeUpload" text="Shortlist Resumes" />
                <FooterLink href="/hr/hrEmail" text="Auto-Email Candidates" />
                <FooterLink href="/hr/interview" text="Interview Process" />
              </ul>
            </div>

            {/* Column 4: Help */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Help</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <FooterLink href="/hr/contactUs" text="Contact Us" />
                <FooterLink href="/hr/policy" text="Privacy Policy" />
              </ul>
            </div>
          </div>

          {/* Divider with Dynamic Year */}
          <div className="border-t border-gray-700/50 mt-16 pt-8 text-center text-sm text-gray-500">
            <p>© {currentYear} Jobform Automator. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FooterLink = ({ href, text }) => (
  <li>
    <Link
      href={href}
      className="hover:text-white transition-colors duration-200"
    >
      {text}
    </Link>
  </li>
);

export default Footer;
