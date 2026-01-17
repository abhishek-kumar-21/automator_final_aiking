/** @format */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Plus } from "lucide-react"; // Using lucide-react for the clean plus icon

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const faqs = [
    {
      question: "How does Jobform Automator work?",
      answer:
        "Jobform Automator uses AI to instantly apply to jobs, optimize your resume, and reach recruiters—so you can get hired faster with less effort.",
    },
    {
      question: "Can I customize the information that gets filled in?",
      answer:
        "Yes, you can customize the information inside the settings page in the Automator Site.",
    },
    {
      question: "Is there a cost to use Jobform Automator?",
      answer:
        "There are both free and premium plans available depending on your needs. You can start for free and upgrade as you grow.",
    },
    {
      question: "When can I expect to get hired using Jobform Automator?",
      answer:
        "The timeline depends on the job market and the positions you're applying for, but the tool significantly streamlines your application process, often reducing time-to-hire by 50%.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-6 md:px-16 lg:px-20 bg-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Your questions answered
        </h2>
        <p className="text-lg text-gray-600">
          Explore our FAQ section to learn more.
        </p>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-100 last:border-none"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center py-6 text-left group transition-all duration-200"
            >
              <span className={`text-lg sm:text-xl font-medium transition-colors duration-200 ${activeIndex === index ? "text-gray-900" : "text-gray-800 group-hover:text-blue-600"}`}>
                {faq.question}
              </span>
              
              <span className="ml-6 flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                <Plus 
                    className={`w-6 h-6 transform transition-transform duration-300 ease-in-out ${activeIndex === index ? "rotate-45" : "rotate-0"}`} 
                />
              </span>
            </button>

            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-base text-gray-600 leading-relaxed pb-8 pr-12">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
