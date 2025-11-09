import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaGraduationCap, 
  FaBars,
  FaTimes,
  FaUser,
  FaArrowRight
} from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isAuthPage = location.pathname.includes("/login") || location.pathname.includes("/register");

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo - Bold & Clean */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition">
              <FaGraduationCap className="text-white text-xl" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight">CareerGuide</span>
              <span className="block text-xs text-gray-500 font-medium">Lesotho</span>
            </div>
          </Link>

          {/* Desktop: Simple Right-Aligned Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-gray-700 hover:text-black font-medium transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-800 transition shadow-md"
            >
              Get Started
              <FaArrowRight className="text-sm" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black transition"
          >
            {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Width, Clean Slide Down */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-5 py-6 space-y-5">
              <Link
                to="/login"
                className="block text-lg font-medium text-gray-700 hover:text-black transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block bg-black text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-gray-800 transition shadow-md"
              >
                Get Started Now
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 font-medium mb-3">Need help?</p>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-black">
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}