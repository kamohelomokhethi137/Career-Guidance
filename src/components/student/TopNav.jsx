// TopNav.jsx
import React, { useState, useEffect } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

const TopNav = () => {
  const [studentName, setStudentName] = useState("Student");


  // pick the best display name from the user object
  
  const getDisplayName = (user) => {
    if (!user) return "Student";

    // Adjust the property names to whatever your backend returns
    return (
      user.name ||
      user.fullName ||
      user.firstName ||
      (user.email && user.email.split("@")[0]) ||
      "Student"
    );
  };


  // Load on first render

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setStudentName(getDisplayName(user));
    }
  }, []);


  //  React to changes made in *other* tabs

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "user" || e.key === null) {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        setStudentName(getDisplayName(user));
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);


  //  React to changes made in the *same* tab (login/logout)

  useEffect(() => {
    const handler = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setStudentName(getDisplayName(user));
    };

    window.addEventListener("userUpdated", handler);
    return () => window.removeEventListener("userUpdated", handler);
  }, []);

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
      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl w-full max-w-xs md:max-w-md lg:max-w-lg">
        <FaSearch className="text-white/60 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-white w-full hidden md:block"
        />
        <span className="md:hidden text-white/60 text-xs">Search</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative">
          <FaBell className="text-lg md:text-xl text-white hover:text-gray-300 transition" />
          <span className="absolute -top-1 -right-2 bg-white text-black text-xs font-bold px-1.5 rounded-full">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              studentName
            )}&background=fff&color=000`}
            alt="Profile"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10"
          />
          <span className="text-sm font-medium hidden sm:block">
            {studentName}
          </span>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNav;