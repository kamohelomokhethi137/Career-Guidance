import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBriefcase, FaUsers, FaCheckCircle, FaClock } from "react-icons/fa";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import CompanySidebar from "../../components/company/Sidebar";
import CompanyTopNav from "../../components/company/TopNav";
import { ToastContainer } from "react-toastify";

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
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    approvedApplicants: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [companyName, setCompanyName] = useState("Company");
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = localStorage.getItem("uid");
      setCompanyName(user.companyName || user.name || "Company");
      setCompanyId(uid);
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);
  }, []);

  // Load jobs and applications data
  useEffect(() => {
    if (!companyId) return;

    // Load active jobs
    const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", companyId), where("status", "==", "active"));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const activeJobsCount = snapshot.size;

      // Load job applications
      const appsQuery = query(collection(db, "jobApplications"), where("companyId", "==", companyId));
      const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
        const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalApplicants = applications.length;
        const approvedApplicants = applications.filter(app => app.status === "approved").length;

        setStats({
          activeJobs: activeJobsCount,
          totalApplicants: totalApplicants,
          approvedApplicants: approvedApplicants
        });

        // Generate recent activity
        const recentApps = applications
          .sort((a, b) => (b.appliedAt?.toDate?.() || 0) - (a.appliedAt?.toDate?.() || 0))
          .slice(0, 3)
          .map(app => ({
            id: app.id,
            msg: `${app.studentName} applied for ${app.jobTitle}`,
            time: formatTime(app.appliedAt?.toDate?.() || new Date())
          }));

        setRecentActivity(recentApps);
      });

      return () => unsubscribeApps();
    });

    return () => unsubscribeJobs();
  }, [companyId]);

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const displayStats = [
    { 
      label: "Active Jobs", 
      value: stats.activeJobs, 
      icon: FaBriefcase, 
      color: "text-blue-400", 
      bg: "bg-blue-900", 
      link: "/company/jobs" 
    },
    { 
      label: "Total Applicants", 
      value: stats.totalApplicants, 
      icon: FaUsers, 
      color: "text-purple-400", 
      bg: "bg-purple-900", 
      link: "/company/applications" 
    },
    { 
      label: "Approved", 
      value: stats.approvedApplicants, 
      icon: FaCheckCircle, 
      color: "text-green-400", 
      bg: "bg-green-900", 
      link: "/company/applications?filter=approved" 
    },
  ];

  return (
    <div className="bg-black min-h-screen text-white flex">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {companyName}!</h1>
            <p className="text-white/70">Manage jobs and discover top talent.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {displayStats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <StatCard s={s} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><FaClock /> Recent Activity</h2>
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map(r => (
                    <div key={r.id} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <p className="text-sm">{r.msg}</p>
                      <p className="text-xs text-gray-500">{r.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent activity
                  </div>
                )}
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