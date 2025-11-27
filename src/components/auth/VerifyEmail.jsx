import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelopeOpenText, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
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
  const role = queryParams.get("role"); // No fallback; must come from query

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // === Handle Firebase Auth state ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Reload to get fresh emailVerified status
        await currentUser.reload();
        if (currentUser.emailVerified && !hasRedirected.current) {
          handleVerified();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // === Polling fallback ===
  useEffect(() => {
    if (!email || hasRedirected.current) return;

    intervalRef.current = setInterval(async () => {
      if (hasRedirected.current) {
        clearInterval(intervalRef.current);
        return;
      }

      setIsChecking(true);
      try {
        const currentUser = auth.currentUser;
        if (currentUser) await currentUser.reload();

        if (currentUser?.emailVerified && !hasRedirected.current) {
          handleVerified();
          return;
        }

        // Backend fallback
        const resp = await fetch(`${BACKEND_URL}/auth/check-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (resp.ok) {
          const json = await resp.json();
          if (json.verified && !hasRedirected.current) handleVerified();
        }
      } catch (err) {
        console.warn("Verification check failed:", err);
      } finally {
        setIsChecking(false);
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [email]);

  // === Verified handler ===
  const handleVerified = () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    clearInterval(intervalRef.current);

    toast.success("Email verified successfully! Redirecting to login...", {
      autoClose: 1800,
    });

    setTimeout(() => navigate("/login", { replace: true }), 1500);
  };

  // === Resend Verification Email ===
  const handleResendVerification = async () => {
    if (!email || !role) {
      toast.error("Email and role are required to resend the verification link.");
      return;
    }

    setIsSending(true);
    const loadingToastId = toast.loading("Sending verification email...");

    try {
      const resp = await fetch(`${BACKEND_URL}/auth/resend-verification`, {
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
