// src/pages/company/Dashboard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBriefcase, FaUsers, FaCheckCircle, FaClock } from "react-icons/fa";
import CompanySidebar from "../../components/company/Sidebar";
import CompanyTopNav from "../../components/company/TopNav";
import { ToastContainer } from "react-toastify";

const stats = [
  { label: "Active Jobs", value: 4, icon: FaBriefcase, color: "text-blue-400", bg: "bg-blue-900", link: "/company/post-job" },
  { label: "Total Applicants", value: 89, icon: FaUsers, color: "text-purple-400", bg: "bg-purple-900", link: "/company/applications" },
  { label: "Interview Ready", value: 23, icon: FaCheckCircle, color: "text-green-400", bg: "bg-green-900", link: "/company/applications" },
];

const recent = [
  { id: 1, msg: "3 new qualified applicants for Software Engineer", time: "1h ago" },
  { id: 2, msg: "Posted job: Marketing Intern", time: "2h ago" },
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

const CompanyDashboard = () => {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav companyName="Tech Solutions Ltd" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, Tech Solutions!</h1>
            <p className="text-white/70">Manage jobs and discover top talent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StatCard s={s} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><FaClock /> Recent Activity</h2>
              <div className="space-y-2">
                {recent.map(r => (
                  <div key={r.id} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-sm">{r.msg}</p>
                    <p className="text-xs text-gray-500">{r.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/company/post-job" className="block">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition">
                    <FaBriefcase className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Post Job</p>
                  </div>
                </Link>
                <Link to="/company/applications" className="block">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl text-center hover:scale-105 transition">
                    <FaUsers className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">View Applicants</p>
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

export default CompanyDashboard;