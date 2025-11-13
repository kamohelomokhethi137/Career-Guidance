// src/pages/institute/Applications.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaCheck, FaTimes, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  orderBy,
} from "firebase/firestore";

const StudentApplications = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [indexError, setIndexError] = useState(false);

  // Load logged-in institute
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoadingAuth(false);
  }, []);

  // Load applications
  useEffect(() => {
    if (!user) {
      setLoadingApps(false);
      return;
    }

    const instituteId = localStorage.getItem("uid");
    
    // First try without ordering to avoid index error
    const q = query(
      collection(db, "applications"),
      where("institute", "==", instituteId)
      // Removed orderBy to avoid index requirement initially
    );

    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const apps = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let studentName = "Unknown Student";
            let courseName = "Unknown Course";

            try {
              const studentDoc = await getDoc(doc(db, "users", data.studentId));
              if (studentDoc.exists()) {
                studentName = studentDoc.data().fullName || studentDoc.data().name || "Student";
              }

              const courseDoc = await getDoc(doc(db, "courses", data.courseId));
              if (courseDoc.exists()) {
                courseName = courseDoc.data().name || "Course";
              }
            } catch (err) {
              console.log("Error fetching student/course:", err);
            }

            return {
              id: docSnap.id,
              studentName,
              courseName,
              status: data.status || "pending",
              appliedAt: data.appliedAt?.toDate?.() || new Date(),
              docs: data.docs || 0,
              personalStatement: data.personalStatement || "",
            };
          })
        );

        // Sort manually by appliedAt since we removed orderBy
        const sortedApps = apps.sort((a, b) => b.appliedAt - a.appliedAt);
        
        setApplications(sortedApps);
        setLoadingApps(false);
        setIndexError(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        
        if (err.code === "failed-precondition") {
          setIndexError(true);
          toast.warning(
            <div>
              <p>Index required for optimal performance.</p>
              <a 
                href="https://console.firebase.google.com/v1/r/project/carear-64cbe/firestore/indexes?create_composite=ClFwcm9qZWN0cy9jYXJlYXltNjRjYmUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FwcGxpY2F0aW9ucy9pbmRleGVzL18QARoNCglpbnN0axR1dGUQARoNCgllnCHBsaWVkQXQQAhoMCghfX25hbWVfXxAC" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Create Index Here
              </a>
            </div>,
            { autoClose: 10000 }
          );
        } else {
          toast.error("Failed to load applications: " + err.message);
        }
        setLoadingApps(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "applications", id), { status });
      toast.success(`Application ${status}!`);
    } catch (e) {
      toast.error("Failed to update status: " + e.message);
    }
  };

  const viewApplication = (app) => {
    toast.info(
      <div className="max-w-md">
        <h3 className="font-bold mb-2">Application Details</h3>
        <p><strong>Student:</strong> {app.studentName}</p>
        <p><strong>Course:</strong> {app.courseName}</p>
        <p><strong>Applied:</strong> {app.appliedAt.toLocaleDateString()}</p>
        <p><strong>Status:</strong> {app.status}</p>
        {app.personalStatement && (
          <div className="mt-2">
            <strong>Personal Statement:</strong>
            <p className="text-sm text-gray-300 mt-1 bg-gray-800 p-2 rounded">
              {app.personalStatement}
            </p>
          </div>
        )}
      </div>,
      { autoClose: 8000 }
    );
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <FaSpinner className="animate-spin text-2xl mr-2" />
        Checking login...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-16 rounded-3xl">
          <h1 className="text-5xl font-bold mb-6">Demo Mode</h1>
          <p className="text-2xl mb-8">Please log in to manage applications</p>
          <a href="/login" className="bg-white text-black px-12 py-5 rounded-xl text-2xl font-bold">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={user.institutionName || user.fullName || "Institute"} />
        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Student Applications</h1>
            <div className="text-sm text-gray-400">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </div>
          </div>

          {indexError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-900 border border-yellow-700 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-yellow-400 text-xl" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-400">Index Required</p>
                  <p className="text-yellow-200 text-sm">
                    For better performance, create the required Firestore index.
                  </p>
                  <a
                    href="https://console.firebase.google.com/v1/r/project/carear-64cbe/firestore/indexes?create_composite=ClFwcm9qZWN0cy9jYXJlYXltNjRjYmUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FwcGxpY2F0aW9ucy9pbmRleGVzL18QARoNCglpbnN0axR1dGUQARoNCgllnCHBsaWVkQXQQAhoMCghfX25hbWVfXxAC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 underline text-sm mt-1 inline-block"
                  >
                    Create Index Now
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {loadingApps && (
            <div className="text-center py-32">
              <FaSpinner className="animate-spin text-7xl mx-auto mb-4" />
              <p>Loading applications...</p>
            </div>
          )}

          {!loadingApps && applications.length === 0 && (
            <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-xl text-gray-400 mb-4">No student applications yet.</p>
              <p className="text-gray-500">Applications will appear here when students apply to your courses.</p>
            </div>
          )}

          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">{app.studentName}</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      {app.courseName} • Applied: {app.appliedAt.toLocaleDateString()} • {app.docs} document{app.docs !== 1 ? 's' : ''}
                    </p>
                    {app.personalStatement && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {app.personalStatement}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === "admitted"
                          ? "bg-green-900 text-green-400"
                          : app.status === "rejected"
                          ? "bg-red-900 text-red-400"
                          : "bg-yellow-900 text-yellow-400"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </span>

                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "admitted")}
                          className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          title="Admit Student"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "rejected")}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                          title="Reject Application"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => viewApplication(app)}
                      className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      title="View Application Details"
                    >
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