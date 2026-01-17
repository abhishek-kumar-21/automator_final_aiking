/** @format */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "JASMINE ANDREWS",
      role: "React JS Consultant",
      feedback:
        "Jobform Automator streamlined my application process, saving me countless hours. Thanks to it, I secured a position at <span class='text-blue-600 font-medium'>Infosys</span> and couldn't be happier!",
      image: "/images/team1.png", 
    },
    {
      name: "GODCHOICE BRIGHT",
      role: "Full Stack Engineer",
      feedback:
        "This tool transformed my job search, making it efficient and stress-free. I landed my dream role at <span class='text-blue-600 font-medium'>Uplers</span>, and I highly recommend Jobform Automator!",
      image: "/images/team2.png",
    },
    {
      name: "ARUN KUMAR",
      role: "Sales And Marketing Specialist",
      feedback:
        "Jobform Automator helped me stand out and land interviews at top companies. I’m now proudly working at <span class='text-blue-600 font-medium'>PolicyStacker</span>, and this tool made all the difference!",
      image: "/images/team3.png",
    },
    {
      name: "ARUN KUMAR",
      role: "Sales And Marketing Specialist",
      feedback:
        "Using Jobform Automator was a game-changer! It simplified my applications and helped me secure a role at <span class='text-blue-600 font-medium'>Paytm</span>. Highly recommend it to every job seeker!",
      image: "/images/team4.png", // Ensuring image matches the code logic if file exists
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Trusted by Job Seekers Everywhere
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See how we're streamlining the job search process and saving time for users like you.
          </p>
        </div>

        {/* Testimonials Grid - 2 Columns to match image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 lg:gap-y-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row gap-6 items-start"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Avatar Image */}
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                {/* Feedback Text */}
                <p 
                  className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: testimonial.feedback }}
                />
                
                {/* Name & Role */}
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
