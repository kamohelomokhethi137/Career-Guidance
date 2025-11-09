// src/components/company/TopNav.jsx
import { FaSearch, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";

const TopNav = ({ companyName = "Company" }) => {
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
          placeholder="Search applicants..."
          className="bg-transparent outline-none text-sm text-white w-full hidden md:block"
        />
        <span className="md:hidden text-xs text-white/60">Search</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative">
          <FaBell className="text-xl" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
            5
          </span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black font-bold">
            {companyName[0]}
          </div>
          <span className="hidden sm:block font-medium">{companyName}</span>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNav;