/** @format */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { getDatabase, get, update, ref } from "firebase/database";
import app from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

const COUNTRY_OPTIONS = [
  { code: "IN", name: "India", currency: "INR" },
  { code: "US", name: "Others", currency: "USD" },
  // Add more countries/currencies as needed
];

async function getUserLocation() {
  // Try geolocation-db
  try {
    const res = await fetch("https://geolocation-db.com/json/");
    if (res.ok) {
      const data = await res.json();
      console.log(data.country_code);
      if (data.country_code) return data;
    }
  } catch {}
  // Fallback: ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      console.log(data.country_code);
      if (data.country_code) return data;
    }
  } catch {}
  // Fallback: ipinfo.io
  try {
    const res = await fetch("https://ipinfo.io/json");
    if (res.ok) {
      const data = await res.json();
      console.log(data.country);
      if (data.country) return { country_code: data.country, country_name: data.country };
    }
  } catch {}
  // All failed
  return null;
}

const PricingSection = () => {
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [country_name, setCountryname] = useState("");
  const [error, setError] = useState(null);
  const [uid, setUid] = useState("");
  const [manualSelect, setManualSelect] = useState(false);
  // NEW STATE: Track which card index is currently hovered
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
    // Always try to fetch the user's current location first
    (async () => {
      const data = await getUserLocation();
      if (data && data.country_code) {
        setCountry(data.country_code);
        setCountryname(data.country_name || "Unknown");
        setCurrency(data.country_code === "IN" ? "INR" : "USD");
        localStorage.setItem(
          "userCountryCurrency",
          JSON.stringify({
            code: data.country_code,
            name: data.country_name || "Unknown",
            currency: data.country_code === "IN" ? "INR" : "USD",
          })
        );
      } else {
        // If location fetch fails, try to use cached value
        const cached = localStorage.getItem("userCountryCurrency");
        if (cached) {
          try {
            const { code, name, currency } = JSON.parse(cached);
            setCountry(code);
            setCountryname(name);
            setCurrency(currency);
          } catch {
            setError("Unable to detect location. Please select your country.");
            setManualSelect(true);
          }
        } else {
          setError("Unable to detect location. Please select your country.");
          setManualSelect(true);
        }
      }
    })();
  }, []);

  useEffect(() => {
    console.log("State updated:", { country, country_name, currency, error });
  }, [currency, country, country_name, error]);

  useEffect(() => {
    const checkSubscriptionStatus = async (uid) => {
      try {
        const paymentRef = ref(db, `hr/${uid}/Payment`);
        const snapshot = await get(paymentRef);
        if (!snapshot.exists()) {
          return { isPremium: false, paymentData: null };
        }
        const paymentData = snapshot.val();
        if (paymentData.Status === "Premium" && paymentData.End_Date) {
          const endDate = new Date(paymentData.End_Date.replace(" ", "T") + "Z");
          const now = new Date();
          if (endDate < now) {
            // Downgrade to Free
            await update(paymentRef, {
              Status: "Free",
              SubscriptionType: "Free",
              End_Date: null
            });
            return { isPremium: false, paymentData: { ...paymentData, Status: "Free", SubscriptionType: "Free", End_Date: null } };
          }
        }
        return { isPremium: paymentData.Status === "Premium", paymentData };
      } catch (error) {
        console.error("Error checking subscription status:", error);
        return { isPremium: false, paymentData: null };
      }
    };
    if (uid) checkSubscriptionStatus(uid)
  }, [uid])

  const formatPrice = (usd, inr) => {
    return currency === "INR" ? `${inr.toLocaleString("en-IN")}` : `${usd}`;
  };

  const handleManualSelect = (e) => {
    const selected = COUNTRY_OPTIONS.find(opt => opt.code === e.target.value);
    if (selected) {
      setCountry(selected.code);
      setCountryname(selected.name);
      setCurrency(selected.currency);
      setManualSelect(false);
      setError(null);
      localStorage.setItem(
        "userCountryCurrency",
        JSON.stringify({ code: selected.code, name: selected.name, currency: selected.currency })
      );
    }
  };

  const plans = [
    {
      name: "Basic",
      priceUSD: "Free",
      priceINR: "Free",
      description: "Essential HR Tools to Streamline Recruitment",
      features: [
        "Auto-Apply up to 10 jobs/day",
        "AI Autofill on job forms",
        "One click ATS Resume Builder",
        "Delete your data anytime",
      ],
      buttonText: "Get Started",
      redirectUrl: "https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa",
      isPremium: false,
    },
    {
      name: "Premium",
      priceUSD: "$49",
      priceINR: "₹1499",
      description: "Advanced HR Features for Efficient Talent Acquisition",
      features: [
        "All in Beginner plan",
        "100 Auto Email to Recruiters",
        "Auto-Apply 300 jobs Daily",
        "Skill Suggestions Based on Job Market Trends",
        "Advanced AI-Crafted Resume",
      ],
      buttonText: "Subscribe",
      isPremium: true, // Used for highlighting
      bestSeller: true,
    },
    {
      name: "Diamond",
      priceUSD: "$99",
      priceINR: "₹2999",
      description: "Comprehensive HR Solutions Until Hiring Goals Are Met",
      features: [
        "All in Premium Plan",
        "Priority Email + Call Support",
        "1000 Auto Email to Recruiters",
        "Real-Time Skill Gap Analysis with Free Learning Links",
      ],
      buttonText: "Subscribe",
      isPremium: false,
    },
  ];

  function handlePyment(name, usd, inr) {
    if (name !== "Basic") {
      const selectedPrice = currency === "INR" ? inr : usd;
      window.location.href = `/payment?plan=${encodeURIComponent(
        name
      )}&price=${encodeURIComponent(selectedPrice)}&currency=${currency}&for=${encodeURIComponent("hr")}`;
    } else {
        // Handle Basic plan click if needed (e.g. redirect to extension)
         window.open(
        "https://chromewebstore.google.com/detail/jobform-automator-ai-auto/lknamgjmcmbfhcjjeicdndokedcmpbaa",
        "_blank"
      );
    }
  }

  return (
    <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-none shadow-none outline-none">
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
          Choose the plan that best supports your HR recruitment needs and unlock more
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
                onChange={handleManualSelect}
              >
                <option value="" disabled>Select country</option>
                {COUNTRY_OPTIONS.map(opt => (
                    <option key={opt.code} value={opt.code}>{opt.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start group">
          {plans.map((plan, index) => {
            // Determine blur/hover states
            const isBlurred = hoveredIndex !== null && hoveredIndex !== index;
            const isHovered = hoveredIndex === index;

            // Base classes
            let cardClasses =
              "relative rounded-3xl p-8 transition-all duration-300 ease-in-out origin-center ";

            // Styling based on premium/standard
            if (plan.isPremium) {
              cardClasses +=
                "bg-blue-50 border border-blue-100 shadow-sm z-10 scale-105 ";
            } else {
              cardClasses += "bg-gray-50 border border-gray-100 shadow-sm ";
            }

            // Apply blur/hover effects
            if (isBlurred) {
              cardClasses += "blur-[2px] opacity-75 scale-[0.98] grayscale-[30%]";
            } else if (isHovered) {
              cardClasses += "hover:-translate-y-2 shadow-xl";
            } else {
              cardClasses += "hover:-translate-y-1";
            }

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cardClasses}
              >
                {/* Best Seller Badge */}
                {plan.bestSeller && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
                        Best seller
                    </div>
                )}

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
