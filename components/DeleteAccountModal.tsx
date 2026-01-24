import { useState, useEffect } from "react";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  User,
  Auth,
} from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import app, { auth } from "@/firebase/config";
import { toast } from "react-toastify";
import { AlertTriangle, X } from "lucide-react"; // Added icons for better UI

interface DeleteAccountModalProps {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const [reason, setReason] = useState<string>("");
  const [confirmation, setConfirmation] = useState<string>("");
  const [showReauth, setShowReauth] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const db = getDatabase(app);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      let email = auth.currentUser.email || "";
      setEmail(email);
    }
  }, []);

  const deleteUserData = async (uid: string): Promise<void> => {
    try {
      const userRef = ref(db, `user/${uid}`);
      await remove(userRef);
      console.log("User data deleted from Realtime Database");
    } catch (error: any) {
      console.error("Error deleting user data:", error.message);
      throw error;
    }
  };

  // SAVE DELETED MESSAGE IN FIREBASE
  const handleSaveMessage = async (uid: string, email: string, reason: string): Promise<void> => {
    try {
      const messageRef = ref(db, `DeletedUser/Message/${uid}`);
      await set(messageRef, {
        email,
        text: reason,
        timestamp: Date.now(), // Optional: Add timestamp for tracking
      });
      console.log("Message saved successfully for UID:", uid);
    } catch (error: any) {
      console.error("Error saving message:", error.message);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.signOut();
      console.log("User signed out");
      localStorage.clear();
      console.log("LocalStorage cleared");

      // Notify extension (replace with actual implementation if needed)
      const notificationSuccess = notifyExtensionOnLogout();
      console.log("Notification success:", notificationSuccess);
      if (!notificationSuccess) {
        console.warn("Logout notification may not have been processed correctly");
      }

      setTimeout(() => {
        console.log("Redirecting...");
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      alert("Error logging out: " + error.message);
    }
  };

  const handleReauthenticate = async (user: User): Promise<void> => {
    console.log("Starting re-authentication");
    try {
      const providerData = user.providerData[0]?.providerId;
      console.log("Provider:", providerData);

      if (providerData === "password") {
        console.log("Attempting email/password re-auth");
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerData === "google.com") {
        console.log("Attempting Google re-auth");
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        throw new Error(`Unsupported provider: ${providerData}`);
      }

      console.log("Re-authentication successful, retrying deletion");
      await deleteUserData(user.uid);
      await deleteUser(user);
      toast.success("Account deleted successfully!");
      await handleLogout();
      setShowReauth(false);
      onClose();
    } catch (error: any) {
      console.error("Re-authentication failed:", error.message);
      alert("Re-authentication failed: " + error.message);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (confirmation.toUpperCase() !== "DELETE") {
        alert("Please type 'DELETE' to confirm.");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert("No user is signed in.");
        return;
      }

      try {
        await handleSaveMessage(user.uid, email, reason);
        await deleteUserData(user.uid);
        await deleteUser(user);
        toast.success("Account deleted successfully!");
        await handleLogout();
        onClose();
      } catch (error: any) {
        if (error.code === "auth/requires-recent-login") {
          console.log("Requires recent login, showing re-auth form");
          setShowReauth(true);
        } else {
          console.error("Delete error:", error.message);
          alert("Failed to delete account: " + error.message);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error in handleDelete:", error.message);
      alert("An unexpected error occurred: " + error.message);
    }
  };

  // Placeholder for notifyExtensionOnLogout
  const notifyExtensionOnLogout = (): boolean => {
    return true; 
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-scaleIn border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Warning Style */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-red-700">Delete Account</h2>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-white/50"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Are you sure you want to delete your account? This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone. All your data will be erased immediately.
          </p>

          {!showReauth ? (
            <>
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  To confirm, type <span className="font-bold text-red-600">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 bg-gray-50 text-center font-bold tracking-wider"
                />
              </div>
              
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Reason for leaving (optional):
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="We're sorry to see you go..."
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder-gray-400 bg-white min-h-[80px] resize-none text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirmation.toUpperCase() !== "DELETE"}
                  className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-all shadow-sm ${
                    confirmation.toUpperCase() === "DELETE"
                      ? "bg-red-600 hover:bg-red-700 hover:shadow-md"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Delete Account
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 mb-4">
                For security reasons, please confirm your identity to complete deletion.
              </div>
              
              {auth.currentUser?.providerData[0]?.providerId === "password" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-600 my-4">
                  Please sign in again with your {auth.currentUser?.providerData[0]?.providerId} account.
                </p>
              )}
              
              <div className="flex gap-3 mt-6">
                 <button
                  onClick={() => setShowReauth(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => handleReauthenticate(auth.currentUser!)}
                  className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow-sm"
                >
                  {auth.currentUser?.providerData[0]?.providerId === "password"
                    ? "Verify & Delete"
                    : "Sign in with Google"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}