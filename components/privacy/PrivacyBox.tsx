/** @format */
import React from "react";
import Image from "next/image";

const PrivacyBox = () => {
  return (
    <div className="bg-white w-full py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
      {/* Outer Card Container */}
      <div className="relative w-full max-w-5xl bg-[#F4F8FC] border border-[#1a72ca] rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 gap-12">
        
        {/* Left: Text Content */}
        <div className="max-w-xl text-center md:text-left z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-raleway">
            Your Privacy Matters to us
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-medium">
            Discover how we protect your personal information and ensure a secure experience while using our services.
          </p>
        </div>

        {/* Right: Illustration */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center md:justify-end">
             {/* Use your specific image path here. 
                I'm using a placeholder size based on the image provided.
             */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
                <Image
                src="/images/privacy-illustration.png" // Ensure you upload the girl/document illustration to this path
                alt="Privacy Illustration"
                fill
                className="object-contain"
                priority
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyBox;
