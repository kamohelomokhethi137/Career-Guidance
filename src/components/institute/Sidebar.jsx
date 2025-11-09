// src/components/institute/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaHome, FaBuilding, FaBookOpen, FaUsers, FaCheckCircle, 
  FaBell, FaUser, FaBars, FaTimes, FaSignOutAlt 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_WIDTH = "w-64";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/institute/dashboard" },
    { name: "Faculties", icon: <FaBuilding />, path: "/institute/faculties" },
    { name: "Courses", icon: <FaBookOpen />, path: "/institute/courses" },
    { name: "Applications", icon: <FaUsers />, path: "/institute/applications" },
    { name: "Admissions", icon: <FaCheckCircle />, path: "/institute/admissions" },
    { name: "Profile", icon: <FaUser />, path: "/institute/profile" }
    // { name: "Notifications", icon: <FaBell />, path: "/institute/notifications" },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white flex items-center justify-between px-4 py-3 z-50 border-b border-white/10">
        <h1 className="text-lg font-bold">Institute Portal</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={`hidden md:flex bg-black text-white ${SIDEBAR_WIDTH} h-screen fixed left-0 top-0 flex-col border-r border-white/10`}
      >
        <Logo />
        <Nav items={navItems} />
        <Logout onLogout={handleLogout} />
        <Footer />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className={`fixed top-0 left-0 h-full ${SIDEBAR_WIDTH} bg-black text-white z-50 flex-col border-r border-white/10 md:hidden`}
            >
              <Logo />
              <Nav items={navItems} onNav={() => setIsOpen(false)} />
              <Logout onLogout={handleLogout} />
              <Footer />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Logo = () => (
  <div className="text-center py-6 text-xl font-bold border-b border-white/10">
    Institute Portal
  </div>
);

const Nav = ({ items, onNav }) => (
  <nav className="flex-1 mt-6">
    {items.map(item => (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={onNav}
        className={({ isActive }) =>
          `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${
            isActive ? "bg-white text-black" : "text-white hover:bg-white/10"
          }`
        }
      >
        <span className="text-lg">{item.icon}</span>
        {item.name}
      </NavLink>
    ))}
  </nav>
);

const Logout = ({ onLogout }) => (
  <button
    onClick={onLogout}
    className="flex items-center gap-3 px-6 py-3 mt-4 text-sm font-medium text-white hover:bg-red-600"
  >
    <FaSignOutAlt /> Logout
  </button>
);

const Footer = () => (
  <div className="mt-auto p-6 border-t border-white/10 text-center text-xs text-white/60">
    © {new Date().getFullYear()} Institute
  </div>
);

export default Sidebar;