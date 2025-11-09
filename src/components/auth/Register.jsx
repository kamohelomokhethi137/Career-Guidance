import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaPhone,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import AuthLayout from "./AuthLayout";

/* ────────────────────────────────────────────────────────────── */
/* ── Reusable InputField ─────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────── */
function InputField({
  icon: Icon,id,name,type = "text",placeholder, value,onChange,disabled,isPasswordField = false,show = false,toggleShow,
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        name={name}
        type={isPasswordField ? (show ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required
        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-black focus:border-black transition 
                   disabled:opacity-50"
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={toggleShow}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* ── Role Dropdown ───────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────── */
function RoleDropdown({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { value: "student", label: "Student", description: "Apply for courses and track applications" },
    { value: "institute", label: "Institution", description: "Manage courses and student applications" },
    { value: "company", label: "Company", description: "Post jobs and review applicants" },
  ];

  const selectedRole = roles.find((role) => role.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-black focus:border-black transition 
                   disabled:opacity-50 text-left bg-white"
      >
        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <div>
          <div className="font-medium">
            {selectedRole ? selectedRole.label : "Select your role"}
          </div>
          {selectedRole && (
            <div className="text-sm text-gray-500 truncate">
              {selectedRole.description}
            </div>
          )}
        </div>
        <FaChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => {
                onChange(role.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{role.label}</div>
              <div className="text-sm text-gray-500">{role.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* ── MAIN COMPONENT ─────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────── */
export default function Register() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    role: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    institutionName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email");

  useEffect(() => {
    if (emailFromQuery) {
      setFormData((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [emailFromQuery]);

  const isInstituteOrCompany = formData.role === "institute" || formData.role === "company";

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role, institutionName: "" }));
  };

  /* ── Validation ────────────────────────────────────────────── */
  const validateForm = () => {
    const { role, fullName, email, password, confirmPassword, phone, institutionName } = formData;

    if (!role) return toast.error("Please select a role"), false;
    if (!fullName.trim()) return toast.error("Enter full name"), false;
    if (isInstituteOrCompany && !institutionName.trim())
      return toast.error(`Enter ${role === "institute" ? "institution" : "company"} name`), false;
    if (!email.trim()) return toast.error("Enter email"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Invalid email format"), false;
    if (!phone.trim()) return toast.error("Enter phone number"), false;
    if (password.length < 6) return toast.error("Password must be at least 6 characters"), false;
    if (password !== confirmPassword) return toast.error("Passwords do not match"), false;
    if (!acceptedTerms) return toast.error("Accept Terms & Conditions"), false;

    return true;
  };

  /* ── Submit: Call Backend /auth/register ───────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Creating account...");

    try {
      const { data } = await axios.post(`${BACKEND_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        phone: formData.phone,
        institutionName: isInstituteOrCompany ? formData.institutionName : "",
      });

      toast.update(loadingToast, {
        render: data.message || "Account created! Please check your email to verify.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Optional: Save for later use (e.g., in StudentProfile)
      localStorage.setItem("uid", data.uid);
      localStorage.setItem("role", data.role);

      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&role=${formData.role}`);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast.update(loadingToast, {
        render: error.response?.data?.error || "Registration failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const heading = formData.role
    ? `Register as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`
    : "Create Your Account";

  const subHeading = formData.role
    ? `Create your ${formData.role} account to get started`
    : "Select your role and fill in your details";

  return (
    <AuthLayout type="register" heading={heading} subHeading={subHeading}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
          <RoleDropdown value={formData.role} onChange={handleRoleChange} disabled={isLoading} />
        </motion.div>

        {/* Full Name */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isInstituteOrCompany ? "Contact Name" : "Full Name"}
          </label>
          <InputField
            icon={FaUser}
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={isInstituteOrCompany ? "Contact person's full name" : "Your full name"}
            disabled={isLoading}
          />
        </motion.div>

        {/* Institution / Company */}
        {isInstituteOrCompany && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.role === "institute" ? "Institution Name" : "Company Name"}
            </label>
            <InputField
              icon={FaBuilding}
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={handleChange}
              placeholder={`Enter ${formData.role === "institute" ? "institution" : "company"} name`}
              disabled={isLoading}
            />
          </motion.div>
        )}

        {/* Email */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <InputField
            icon={FaEnvelope}
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isLoading || !!emailFromQuery}
          />
        </motion.div>

        {/* Phone */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <InputField
            icon={FaPhone}
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone"
            disabled={isLoading}
          />
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <InputField
            icon={FaLock}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            isPasswordField
            show={showPassword}
            toggleShow={() => setShowPassword((p) => !p)}
            disabled={isLoading}
          />
        </motion.div>

        {/* Confirm Password */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <InputField
            icon={FaLock}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            isPasswordField
            show={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword((p) => !p)}
            disabled={isLoading}
          />
        </motion.div>

        {/* Terms */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1"
          />
          <label className="text-sm text-gray-700">
            I agree to{" "}
            <Link to="/terms" className="font-semibold text-black hover:text-gray-700">Terms</Link>{" "}
            &amp;{" "}
            <Link to="/privacy" className="font-semibold text-black hover:text-gray-700">Privacy</Link>
          </label>
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </motion.div>
      </form>
    </AuthLayout>
  );
}