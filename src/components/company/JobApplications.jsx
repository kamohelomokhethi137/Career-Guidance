import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import CompanySidebar from "./Sidebar";
import CompanyTopNav from "./TopNav";

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    setCompanyId(uid);

    if (!uid) return;

    const appsQuery = query(
      collection(db, "jobApplications"), 
      where("companyId", "==", uid)
    );

    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(appsData);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (appId, status) => {
    try {
      await updateDoc(doc(db, "jobApplications", appId), { status });
      toast.success(`Application ${status}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const filtered = filter === "all" 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "text-green-400";
      case "rejected": return "text-red-400";
      case "pending": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Job Applications</h1>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-4">
            {filtered.map(app => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{app.studentName}</h3>
                    <p className="text-blue-400">{app.jobTitle}</p>
                    <p className="text-sm text-gray-400">
                      Applied: {app.appliedAt?.toDate?.().toLocaleDateString() || "Recently"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)} border ${getStatusColor(app.status).replace('text', 'border')}`}>
                      {app.status}
                    </span>

                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(app.id, "approved")}
                          className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <FaCheck />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, "rejected")}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}

                    <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                      <FaEye />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No {filter === "all" ? "" : filter} applications found
            </div>
          )}
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default JobApplications;