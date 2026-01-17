/** @format */
"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaHome, FaPhoneAlt, FaEnvelope } from "react-icons/fa"; // Importing icons

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    userQuery: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/sendemails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Your query has been sent successfully!");
        setFormData({ name: "", email: "", phoneNumber: "", userQuery: "" });
      } else {
        toast.error("There was an issue sending your query. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("There was an error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* Left Column: Contact Information */}
        <div className="space-y-10">
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Contact Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Get In Touch With Us
            </h1>
          </div>

          <div className="space-y-8">
            {/* Location */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <FaHome size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Our Location</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm">
                  Flat No. 116, AP, Tel Junner, Sairpark Building, Dist, Ale, Alephata, Maharashtra 412411
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <FaPhoneAlt size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Phone Number</h3>
                <p className="text-gray-600 font-medium">+91 9766116839</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <FaEnvelope size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Address</h3>
                <p className="text-gray-600">contact@jobformautomator.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full px-4 py-3.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="w-full px-4 py-3.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone Input */}
            <div>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Your Phone number"
                className="w-full px-4 py-3.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
              />
            </div>

            {/* Message Textarea */}
            <div>
              <textarea
                name="userQuery"
                placeholder="Message"
                rows="4"
                className="w-full px-4 py-3.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 resize-none"
                value={formData.userQuery}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1D4ED8] hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
