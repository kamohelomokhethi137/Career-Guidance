// src/components/institute/TopNav.jsx
import { useState, useEffect } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

const InstituteTopNav = () => {
  const [instituteName, setInstituteName] = useState("Institute");
  const [userEmail, setUserEmail] = useState("");

  // Get the best display name from user data
  const getDisplayName = (userData) => {
    if (!userData) return "Institute";
    
    return (
      userData.institutionName || // From Firestore (your data shows "Acme Lending")
      userData.fullName ||        // From registration
      userData.name ||           // Alternative field
      (userData.email && userData.email.split("@")[0]) || // Fallback to email username
      "Institute"                 // Final fallback
    );
  };

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setInstituteName(getDisplayName(userData));
          setUserEmail(userData.email || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setInstituteName("Institute");
        }
      }
    };

    // Load immediately
    loadUserData();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === null) {
        loadUserData();
      }
    };

    // Listen for custom events (same tab updates)
    const handleUserUpdate = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "Institute") return "IN";
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="
        fixed top-0 left-0 right-0
        md:left-64 md:right-0
        bg-black text-white border-b border-white/10
        flex items-center justify-between
        px-4 py-3 md:px-6 md:py-4
        z-40
      "
    >
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl w-full max-w-xs md:max-w-md lg:max-w-lg transition-colors duration-200">
        <FaSearch className="text-white/60 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search students, courses, applications..."
          className="bg-transparent outline-none text-sm text-white w-full hidden md:block placeholder-white/60"
        />
        <span className="md:hidden text-white/60 text-xs">Search</span>
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <button className="relative hover:text-gray-300 transition-colors duration-200 group">
          <FaBell className="text-lg md:text-xl text-white group-hover:text-gray-300 transition" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full min-w-[18px] text-center">
            3
          </span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar with initials */}
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {getInitials(instituteName)}
          </div>
          
          {/* Institute Info */}
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-white">
              {instituteName}
            </div>
            <div className="text-xs text-gray-400">
              {userEmail || "Institute Account"}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default InstituteTopNav;