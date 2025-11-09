import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import AuthLayout from "./AuthLayout";

// Axios Interceptor: Auto-add token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (emailFromQuery) {
      setFormData((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [emailFromQuery]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) return toast.error("Please fill in all fields");

    setIsLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const { data } = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });

      // === STORE ONLY WHAT YOU NEED ===
      localStorage.setItem("uid", data.uid);
      localStorage.setItem("role", data.role);
      localStorage.setItem("token", data.token);

      // Store user object for dashboard display
      localStorage.setItem("user", JSON.stringify({
        email: data.user.email,
        fullName: data.user.fullName,
        // Add more if needed: phone, institutionName, etc.
      }));

      // === AUTO-REFRESH TOKEN ===
      const refreshToken = async () => {
        try {
          const { data: newData } = await axios.post(`${BACKEND_URL}/auth/refresh-token`, {
            uid: data.uid,
          });
          localStorage.setItem("token", newData.token);
        } catch (err) {
          toast.error("Session expired. Logging out...");
          localStorage.clear();
          navigate("/login");
        }
      };

      const interval = setInterval(refreshToken, 50 * 60 * 1000);
      localStorage.setItem("tokenRefreshInterval", interval);

      toast.update(loadingToast, {
        render: `Welcome back, ${data.user.fullName || data.user.email}!`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      setTimeout(() => navigate(`/${data.role}/dashboard`), 1500);
    } catch (error) {
      toast.update(loadingToast, {
        render: error.response?.data?.error || "Invalid email or password.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout type="login">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading || !!emailFromQuery}
              required
              autoComplete="email"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:opacity-50"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
              autoComplete="current-password"
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </motion.div>

        {/* Forgot password */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-2">
          <Link to="/forgot-password" className="text-sm font-semibold text-black hover:text-gray-700">
            Forgot password?
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
}