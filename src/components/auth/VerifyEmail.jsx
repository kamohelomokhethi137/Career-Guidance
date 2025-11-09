import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelopeOpenText, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import AuthLayout from "./AuthLayout";

export default function VerifyEmail() {
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [emailSentCooldown, setEmailSentCooldown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);
  const hasRedirected = useRef(false);

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");
  const role = queryParams.get("role") || "student";

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.emailVerified && !hasRedirected.current) {
          await onVerifiedDetected(currentUser);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Poll backend for verification (fallback)
  useEffect(() => {
    if (!email || hasRedirected.current) return;

    intervalRef.current = setInterval(async () => {
      if (hasRedirected.current) {
        clearInterval(intervalRef.current);
        return;
      }

      setIsChecking(true);
      try {
        const resp = await fetch(`${BACKEND_URL}/check-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resp.ok) {
          const json = await resp.json();
          if (json.verified && !hasRedirected.current) {
            // Force reload Firebase user
            const freshUser = await auth.currentUser?.reload().then(() => auth.currentUser);
            if (freshUser) {
              await onVerifiedDetected(freshUser);
            }
          }
        }
      } catch (err) {
        console.warn("Backend verification check failed:", err);
      } finally {
        setIsChecking(false);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [email]);

  // === MAIN: Save user data + redirect ===
  const onVerifiedDetected = async (firebaseUser) => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // 1. Get fresh token
    let token = "";
    try {
      token = await firebaseUser.getIdToken();
    } catch (err) {
      console.error("Failed to get ID token", err);
    }

    // 2. Get full profile from backend
    let fullName = firebaseUser.displayName || "";
    try {
      const resp = await axios.get(`${BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fullName = resp.data.fullName || fullName;
    } catch (err) {
      console.warn("Could not fetch profile name, using displayName");
    }

    // 3. Save everything to localStorage
    const userData = {
      email: firebaseUser.email,
      fullName: fullName || firebaseUser.email.split("@")[0],
      uid: firebaseUser.uid,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", role);
    localStorage.setItem("uid", firebaseUser.uid);
    localStorage.setItem("token", token);

    // 4. Success toast
    toast.success(`Email verified! Welcome, ${userData.fullName}!`, {
      autoClose: 1800,
    });

    // 5. Redirect
    setTimeout(() => {
      navigate(`/${role}/dashboard`, { replace: true });
    }, 1500);
  };

  // === Resend Verification Email ===
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email is required to resend the verification link.");
      return;
    }

    setIsSending(true);
    const loadingToastId = toast.loading("Sending verification email...");

    try {
      const resp = await fetch(`${BACKEND_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const json = await resp.json();

      if (resp.ok) {
        toast.update(loadingToastId, {
          render: "Verification email sent! Check your inbox.",
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });

        setEmailSentCooldown(true);
        setTimeout(() => setEmailSentCooldown(false), 30000);
      } else {
        throw new Error(json.error || "Failed to send email");
      }
    } catch (error) {
      toast.update(loadingToastId, {
        render: error.message || "Failed to send verification email",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthLayout type="verify-email">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">
            <FaEnvelopeOpenText className="mx-auto" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>

          <p className="text-sm text-gray-600">
            {email
              ? `A verification link was sent to ${email}. Click the link in the email to verify your account.`
              : "A verification link has been sent to your email. Please check your inbox."}
          </p>

          <div className="w-full">
            <button
              onClick={handleResendVerification}
              disabled={isSending || emailSentCooldown || !email}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </div>
              ) : emailSentCooldown ? (
                <div className="flex items-center justify-center">
                  <FaCheckCircle className="mr-2" />
                  Email Sent
                </div>
              ) : (
                "Resend Verification Email"
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              If you clicked the verification link, this page will automatically detect it and redirect you.
            </p>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {isChecking ? (
              <div className="flex items-center gap-2 justify-center">
                <FaSpinner className="animate-spin" />
                Checking verification status...
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <FaCheckCircle />
                Waiting for verification...
              </div>
            )}
          </div>

          <div className="w-full mt-4">
            <Link to="/login" className="block text-center text-sm text-gray-700 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}