import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUniversity, FaUsers, FaBriefcase, FaChartBar, FaSpinner } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    institutions: 0,
    students: 0,
    companies: 0,
    applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Load admin name
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminName(user.fullName || user.name || "Admin");

    // Load institutions count
    const unsubscribeInstitutes = onSnapshot(collection(db, "institutes"), (snapshot) => {
      setStats(prev => ({ ...prev, institutions: snapshot.size }));
    });

    // Load students count
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const students = snapshot.docs.filter(doc => doc.data().role === "student");
      setStats(prev => ({ ...prev, students: students.length }));
    });

    // Load companies count
    const unsubscribeCompanies = onSnapshot(collection(db, "users"), (snapshot) => {
      const companies = snapshot.docs.filter(doc => doc.data().role === "company");
      setStats(prev => ({ ...prev, companies: companies.length }));
    });

    // Load applications count
    const unsubscribeApplications = onSnapshot(collection(db, "applications"), (snapshot) => {
      setStats(prev => ({ ...prev, applications: snapshot.size }));
    });

    // Set loading to false after initial load
    setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubscribeInstitutes();
      unsubscribeUsers();
      unsubscribeCompanies();
      unsubscribeApplications();
    };
  }, []);

  const displayStats = [
    { 
      label: "Institutions", 
      value: stats.institutions, 
      icon: FaUniversity, 
      color: "text-purple-400", 
      bg: "bg-purple-900", 
      link: "/admin/institutions" 
    },
    { 
      label: "Students", 
      value: stats.students, 
      icon: FaUsers, 
      color: "text-blue-400", 
      bg: "bg-blue-900", 
      link: "/admin/users" 
    },
    { 
      label: "Companies", 
      value: stats.companies, 
      icon: FaBriefcase, 
      color: "text-green-400", 
      bg: "bg-green-900", 
      link: "/admin/companies" 
    },
    { 
      label: "Applications", 
      value: stats.applications, 
      icon: FaChartBar, 
      color: "text-yellow-400", 
      bg: "bg-yellow-900", 
      link: "/admin/reports" 
    },
  ];

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-8 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/70">Manage institutions, users, and system performance.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayStats.map((s, i) => (
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
                    <p className="text-sm font-medium">Manage Institutions</p>
                  </div>
                </Link>
                <Link to="/admin/users" className="block">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl text-center hover:scale-105 transition">
                    <FaUsers className="mx-auto text-2xl mb-2" />
                    <p className="text-sm font-medium">Manage Users</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Institutions</span>
                  <span className="font-semibold">{stats.institutions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Students</span>
                  <span className="font-semibold">{stats.students}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Registered Companies</span>
                  <span className="font-semibold">{stats.companies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Applications</span>
                  <span className="font-semibold">{stats.applications}</span>
                </div>
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