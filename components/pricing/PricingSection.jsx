/** @format */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import app, { auth } from "@/firebase/config";
import { getDatabase, ref, update, get } from "firebase/database";

const PricingSection = () => {
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");
  const [error, setError] = useState(null);
  const [uid, setUid] = useState("");
  const [manualSelect, setManualSelect] = useState(false);
  // 1. NEW STATE: Track which card index is currently hovered
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const db = getDatabase(app);

  useEffect(() => {
    // Set up the Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, set the uid
        setUid(user.uid);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Try primary API
        let response = await fetch("https://geolocation-db.com/json/");
        if (!response.ok) throw new Error("Primary API failed");
        let data = await response.json();
        if (data && data.country_code) {
          setCountry(data.country_code);
          setCountryname(data.country_name || "Unknown");
          setCurrency(data.country_code === "IN" ? "INR" : "USD");
          setManualSelect(false);
          return;
        }
        throw new Error("Primary API returned no country");
      } catch (err1) {
        try {
          // Fallback to secondary API
          let response = await fetch("https://ipapi.co/json/");
          if (!response.ok) throw new Error("Secondary API failed");
          let data = await response.json();
          if (data && data.country_code) {
            setCountry(data.country_code);
            setCountryname(data.country_name || "Unknown");
            setCurrency(data.country_code === "IN" ? "INR" : "USD");
            setManualSelect(false);
            return;
          }
          throw new Error("Secondary API returned no country");
        } catch (err2) {
          setError("Unable to detect location. Please select your country.");
          setCountry("US");
          setCountryname("United States");
          setCurrency("USD");
          setManualSelect(true);
        }
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const checkSubscriptionStatus = async (uid) => {
      try {
        const paymentRef = ref(db, `user/${uid}/Payment`);
        const snapshot = await get(paymentRef);

        if (!snapshot.exists()) {
          return { isPremium: false, paymentData: null };
        }

        const paymentData = snapshot.val();
        if (paymentData.Status === "Premium" && paymentData.End_Date) {
          const endDate = new Date(
            paymentData.End_Date.replace(" ", "T") + "Z"
          );
          const now = new Date();
          if (endDate < now) {
            // Downgrade to Free
            await update(paymentRef, {
              Status: "Free",
              SubscriptionType: "FreeTrialStarted",
              End_Date: null,
            });
            return {
              isPremium: false,
              paymentData: {
                ...paymentData,
                Status: "Free",
                SubscriptionType: "FreeTrialStarted",
                End_Date: null,
              },
            };
          }
        }

        return { isPremium: paymentData.Status === "Premium", paymentData };
      } catch (error) {
        console.error("Error checking subscription status:", error);
        return { isPremium: false, paymentData: null };
      }
    };
    if (uid) {
      checkSubscriptionStatus(uid);
    }
  }, [uid, db]);

  const formatPrice = (usd, inr) => {
    return currency === "INR" ? `${inr.toLocaleString("en-IN")}` : `${usd}`;
  };

  const plans = [
    {
      name: "Basic",
      priceUSD: "Free",
      priceINR: "Free",
      description: "Essential Tools to Kickstart Your Job Search",
      features: [
        "Auto-Apply up to 10 jobs/day",
        "AI Autofill on job forms",
        "One click ATS Resume Builder",
        "Delete your data anytime",
      ],
      buttonText: "Get Started",
      isPremium: false,
    },
    {
      name: "Premium",
      priceUSD: "$20",
      priceINR: "₹499",
      description: "Advanced Features for the Serious Job Seeker",
      features: [
        "All in Beginner plan",
        "100 Auto Email to Recruiters",
        "Auto-Apply 300 jobs Daily",
        "Skill Suggestions Based on Job Market Trends",
        "Advanced AI-Crafted Resume",
      ],
      buttonText: "Subscribe",
      isPremium: true, // Used for styling
    },
    {
      name: "Diamond",
      priceUSD: "$99",
      priceINR: "₹999",
      description: "Untill you are hired",
      features: [
        "All in Premium Plan",
        "Priority Email + Call Supportl",
        "1000 Auto Email to Recruiters",
        "Real-Time Skill Gap Analysis with Free Learning Links",
      ],
      buttonText: "Subscribe",
      isPremium: false,
    },
  ];

  function handlePyment(name, usd, inr) {
    if (name == "Basic") {
      window.open(
        "https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa",
        "_blank"
      );
    }
    if (name !== "Basic") {
      const selectedPrice = currency === "INR" ? inr : usd;
      window.location.href = `/payment?plan=${encodeURIComponent(
        name
      )}&price=${encodeURIComponent(selectedPrice)}&currency=${currency}&for=${encodeURIComponent(
        "candidate"
      )}`;
    }
  }

  return (
    <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header Section */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-800 tracking-tight">
            Pricing
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          The perfect plan for your job hunt
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Choose the plan that best supports your job search and unlock more
          powerful features.
        </p>

        {/* Location Error / Manual Select */}
        {error && (
          <div className="mb-8">
            <p className="text-red-500 mb-2">{error}</p>
            {manualSelect && (
              <select
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full max-w-xs mx-auto p-2.5"
                value={country}
                onChange={(e) => {
                  const code = e.target.value;
                  setCountry(code);
                  setCurrency(code === "IN" ? "INR" : "USD");
                  setCountryname(code === "IN" ? "India" : "United States");
                }}
              >
                <option value="US">Others (USD)</option>
                <option value="IN">India (INR)</option>
              </select>
            )}
          </div>
        )}

        {/* Pricing Cards Grid */}
        {/* Added 'group' class to parent grid container to help coordinate transitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start group">
          {plans.map((plan, index) => {
            // 2. LOGIC: Determine if *this specific card* should be blurred.
            // It should be blurred if 'hoveredIndex' is not null (meaning something is hovered)
            // AND 'hoveredIndex' is not the index of this current card.
            const isBlurred = hoveredIndex !== null && hoveredIndex !== index;
            
            // Determine if this specific card is the one being hovered
            const isHovered = hoveredIndex === index;

            // Base classes - changed transition-transform to transition-all for smoother blur
            let cardClasses =
              "relative rounded-3xl p-8 transition-all duration-300 ease-in-out origin-center ";

            // Add premium vs standard base styling
            if (plan.isPremium) {
              cardClasses +=
                "bg-blue-50 border border-blue-100 shadow-sm z-10 scale-105 ";
            } else {
              cardClasses += "bg-gray-50 border border-gray-100 shadow-sm ";
            }

            // Add Blur / Hover styling conditionally
            if (isBlurred) {
              // Apply blur, reduce opacity, and slightly scale down the inactive cards
              cardClasses += "blur-[2px] opacity-75 scale-[0.98] grayscale-[30%]";
            } else if (isHovered) {
               // Standard hover effect for the active card
               cardClasses += "hover:-translate-y-2 shadow-xl";
            } else {
               // Normal state when mouse is not over the grid section at all
               cardClasses += "hover:-translate-y-1";
            }

            return (
              <div
                key={index}
                // 3. HANDLERS: Update state on mouse enter/leave
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cardClasses}
              >
                {/* Card Title */}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.isPremium ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  {currency && country ? (
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.priceUSD, plan.priceINR)}
                    </span>
                  ) : (
                    <div className="flex justify-center h-10">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() =>
                    handlePyment(plan.name, plan.priceUSD, plan.priceINR)
                  }
                  // Added a check to disable button pointer events if blurred so you can't click blurred cards
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mb-8 ${
                    isBlurred ? "pointer-events-none" : ""
                  } ${
                    plan.isPremium
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                      : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {plan.buttonText}
                </button>

                {/* Features List */}
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <span className="w-2 h-2 mt-1.5 mr-3 bg-blue-600 rounded-full shrink-0" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
