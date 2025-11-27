// src/pages/institute/Applications.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { db } from "../../firebase";
import { collection, doc, onSnapshot, query, where, updateDoc } from "firebase/firestore";

const StudentApplications = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load institute
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Load student applications - REMOVED orderBy to avoid index error
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const instituteId = localStorage.getItem("uid");
    console.log("Loading applications for institute:", instituteId);

    const q = query(
      collection(db, "studentApplications"),
      where("instituteId", "==", instituteId)
      // Removed: orderBy("appliedAt", "desc") - this requires an index
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log("Found applications:", snapshot.docs.length);
        const apps = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            studentName: data.studentName || "Student",
            programTitle: data.programTitle || "Program",
            programType: data.programType,
            academicLevel: data.academicLevel,
            status: data.status || "pending",
            appliedAt: data.appliedAt?.toDate() || new Date(),
          };
        });
        
        // Sort manually instead of using orderBy
        const sortedApps = apps.sort((a, b) => b.appliedAt - a.appliedAt);
        setApplications(sortedApps);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading applications:", error);
        toast.error("Failed to load applications");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Update application status
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "studentApplications", id), { status });
      toast.success(`Application ${status}!`);
    } catch (e) {
      toast.error("Update failed");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <a href="/login" className="bg-white text-black px-6 py-3 rounded-lg font-bold">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={user.institutionName || "Institute"} />
        
        <main className="pt-20 p-6">
          <h1 className="text-2xl font-bold mb-6">Student Applications</h1>

          {loading && (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl mx-auto mb-2" />
              <p>Loading applications...</p>
            </div>
          )}

          {!loading && applications.length === 0 && (
            <div className="text-center py-12 bg-gray-900 rounded-xl">
              <p className="text-gray-400">No student applications yet</p>
              <p className="text-gray-500 text-sm mt-2">Applications will appear here when students apply</p>
            </div>
          )}

          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 p-4 rounded-xl border border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{app.studentName}</h3>
                    <p className="text-gray-400 text-sm">
                      {app.programTitle} • {app.academicLevel}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Applied: {app.appliedAt.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      app.status === "approved" ? "bg-green-900 text-green-400" :
                      app.status === "rejected" ? "bg-red-900 text-red-400" :
                      "bg-yellow-900 text-yellow-400"
                    }`}>
                      {app.status}
                    </span>

                    {app.status === "pending" && (
                      <>
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
                      </>
                    )}

                    <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                      <FaEye />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default StudentApplications;