import { useState, useEffect } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

const TopNav = () => {
  const [userName, setUserName] = useState("Admin");
  const [userInitial, setUserInitial] = useState("A");

  useEffect(() => {
    const loadUser = () => {
      try {
        // Get user data from localStorage (set by your login system)
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const role = localStorage.getItem("role");
        
        // Use fullName from login response, fallback to email or "Admin"
        const name = userData.fullName || userData.name || userData.email || "Admin";
        
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
        
        // Dispatch event for other components to listen to
        window.dispatchEvent(new Event("userUpdated"));
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserName("Admin");
        setUserInitial("A");
      }
    };

    // Load immediately
    loadUser();

    // Listen for storage changes (other tabs) and login events
    window.addEventListener("storage", loadUser);
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userUpdated", loadUser);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 md:left-64 md:right-0 bg-black text-white border-b border-white/10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 z-40"
    >
      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl w-full max-w-md">
        <FaSearch className="text-white/60" />
        <input
          type="text"
          placeholder="Search users, institutions..."
          className="bg-transparent outline-none text-sm text-white w-full hidden md:block"
        />
        <span className="md:hidden text-xs text-white/60">Search</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative">
          <FaBell className="text-xl" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            12
          </span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
            {userInitial}
          </div>
          <span className="hidden sm:block font-medium">{userName}</span>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNav;