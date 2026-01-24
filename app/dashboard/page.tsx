/** @format */
"use client";
import React, { useEffect, useState } from "react";
// import { FaUser, FaChartBar, FaCog, FaSignOutAlt } from "react-icons/fa";
// import { get, ref, getDatabase, update, set } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";
// import ShareMenu from "@/components/shareMenu/shareMenu";
// import RewardsDashboard from "@/components/Reward/reward";
// const db = getDatabase(app);
import DashboardPage from "./_components/DashboardPage";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [refArray, setRefArray] = useState([]);
  // const [notCompletedArray, setNotCompletedArray] = useState([]);
  // const [freeArray, setFreeArray] = useState([]);
  // const [premiumArray, setPremiumArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState(0);
  // const [mess, setMessage] = useState<string>("")


  // type ReferralData = {
  //   uid: string;
  //   name: string;
  //   email: string;
  //   joinedOn: string;
  //   status: string;
  // };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error("You need to be signed in!");
        window.location.href = "/sign-in";
      } else {
        setUid(auth?.currentUser?.uid);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   const fetchName = async () => {
  //     const nameRef = ref(db, `user/${uid}/name`);
  //     const nameSnapshot = await get(nameRef);
  //     if (nameSnapshot.val() === null) {
  //       const fnameRef = ref(db, `user/${uid}/fname`);
  //       const lnameRef = ref(db, `user/${uid}/lname`);
  //       const [fnameSnapshot, lnameSnapshot] = await Promise.all([get(fnameRef), get(lnameRef)]);
  //       const fname = fnameSnapshot.val() || "";
  //       const lname = lnameSnapshot.val() || "";
  //       const fullName = fname + lname;
  //       const nameWithoutSpaces = fullName.trim().replace(/\s/g, "")
  //       setName(nameWithoutSpaces);
  //     } else {
  //       let name = nameSnapshot.val();
  //       const nameWithoutSpaces = name.replace(/\s/g, "");
  //       setName(nameWithoutSpaces);
  //     }
  //   };
  //   if (uid) fetchName();
  // }, [uid]);

//   useEffect(() => {
//     if (!name) return;
//     setMessage(`🚀 Boost your career with AIKING!

// 🎯 Get access to top jobs, resume help & AI tools.

// 💸 Use my referral link to join and get exclusive benefits: window.location.origin}/${name}

// 🔥 Limited time offer! Don’t miss out.`)
//     console.log("name", name)
//     const visitorRef = ref(db, `visitors/${name}`);
//     get(visitorRef).then((snapshot) => {
//       const visitorData = snapshot.val();
//       console.log(visitorData, "visitors")
//       if (!visitorData) return;
//       else {
//         const totalVisitors = Object.keys(visitorData).length;
//         setTotalVisitors(totalVisitors);
//       }
//     });

//     const referralRef = ref(db, `referrals/${name}`);
//     get(referralRef).then((snapshot) => {
//       const data = snapshot.val();
//       if (!data) {
//         setRefArray([]);
//         setLoading(false);
//         return;
//       }
//       // const visitorRef = ref(db, `visitors/${name}`);
//       // get(visitorRef).then((snapshot) => {
//       //   const visitorData = snapshot.val();
//       //   console.log(visitorData,"visitors")
//       //   if (!visitorData) return;
//       //   else {
//       //     const totalVisitors = Object.keys(visitorData).length;
//       //     setTotalVisitors(totalVisitors);
//       //   }
//       // });
//       const referralArray = Object.keys(data);
//       setRefArray(referralArray);
//     });
//   }, [name]);

  // useEffect(() => {
  //   if (!refArray.length) return;
  //   const fetchAndCategorizeReferralData = async () => {
  //     setLoading(true);
  //     const notCompleted = [];
  //     const free = [];
  //     const premium = [];
  //     await Promise.all(
  //       refArray.map(async (uid) => {
  //         console.log("dashboard", uid);
  //         let userRef = ref(db, `hr/${uid}`);
  //         let userData;
  //         try {
  //           let snapshot = await get(userRef);
  //           userData = snapshot.val();

  //           // If no data found in hr/uid, try user/uid
  //           if (!userData) {
  //             userRef = ref(db, `user/${uid}`);
  //             snapshot = await get(userRef);
  //             userData = snapshot.val();
  //           }

  //           if (!userData) return;

  //           const marketingRef = ref(db, `marketing_email/${uid}`);
  //           let fullName = userData.name || "";
  //           if (!fullName) {
  //             const fname = userData.fname || "";
  //             const lname = userData.lname || "";
  //             fullName = `${fname} ${lname}`.trim();
  //           }
  //           let newStatus = "not completed";
  //           if (userData.Payment?.Status === "Free") {
  //             newStatus = "Free";
  //           } else if (userData.Payment?.Status === "Premium") {
  //             newStatus = "Premium";
  //           }
  //           console.log("data", uid, newStatus);
  //           const referralData = {
  //             uid,
  //             name: fullName || "Unknown",
  //             email: userData.email || "Unknown",
  //             joinedOn: userData.createdAt
  //               ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  //               : "Unknown",
  //             status: newStatus,
  //           };
  //           await set(marketingRef, {
  //             email: userData.email || "unknown",
  //             status: newStatus,
  //             emailCount: 0,
  //           });
  //           if (newStatus === "not completed") {
  //             notCompleted.push(referralData);
  //           } else if (newStatus === "Free") {
  //             free.push(referralData);
  //           } else if (newStatus === "Premium") {
  //             premium.push(referralData);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching/storing data for UID:", uid, error);
  //         }
  //       })
  //     );
  //     setNotCompletedArray(notCompleted);
  //     setFreeArray(free);
  //     setPremiumArray(premium);
  //     setLoading(false);
  //   };
  //   fetchAndCategorizeReferralData();
  // }, [refArray]);

  return (
    <div className="px-10 py-6">
      <div className="font-bold md:text-3xl text-xl">
        Dashboard
      </div>

      {/* List of Forms */}
      <DashboardPage />
    </div>
  );
};

export default Dashboard;