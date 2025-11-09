// src/pages/admin/Dashboard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUniversity, FaUsers, FaBriefcase, FaChartBar } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { ToastContainer } from "react-toastify";

const stats = [
  { label: "Institutions", value: 8, icon: FaUniversity, color: "text-purple-400", bg: "bg-purple-900", link: "/admin/institutions" },
  { label: "Students", value: 1240, icon: FaUsers, color: "text-blue-400", bg: "bg-blue-900", link: "/admin/users" },
  { label: "Companies", value: 42, icon: FaBriefcase, color: "text-green-400", bg: "bg-green-900", link: "/admin/companies" },
  { label: "Applications", value: 389, icon: FaChartBar, color: "text-yellow-400", bg: "bg-yellow-900", link: "/admin/reports" },
];

const StatCard = ({ s }) => {
  const Icon = s.icon;
  return (
    <Link to={s.link}>
      <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-900 rounded-xl p-6 border border-gray-800 cursor-pointer hover:border-gray-700">
        <div className="flex justify-between mb-4">
          <div className={`p-3 rounded-lg ${s.bg}`}><Icon className={`text-xl ${s.color}`} /></div>
          <span className="text-3xl font-bold">{s.value}</span>
        </div>
        <p className="text-gray-400 text-sm">{s.label}</p>
      </motion.div>
    </Link>
  );
};

const AdminDashboard = () => {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage institutions, users, and system performance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StatCard s={s} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/institutions" className="block">
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl text-center hover:scale-105 transition">
                    <FaUniversity className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Add Institution</p>
                  </div>
                </Link>
                <Link to="/admin/companies" className="block">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition">
                    <FaBriefcase className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Manage Companies</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default AdminDashboard;