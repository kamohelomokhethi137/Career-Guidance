// src/pages/institute/Admissions.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaTimesCircle, FaPaperPlane, FaSpinner } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

const PublishAdmissions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instituteId, setInstituteId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("uid");
    setInstituteId(storedId);

    if (!storedId) {
      toast.error("No institute ID found.");
      setLoading(false);
      return;
    }

    // Load student applications for this institute
    const appsQuery = query(
      collection(db, "studentApplications"),
      where("instituteId", "==", storedId)
    );

    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
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
          notified: data.notified || false,
        };
      });
      
      setApplications(apps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const publishAll = async () => {
    try {
      const updatePromises = applications
        .filter(app => !app.notified && app.status !== "pending")
        .map(app => 
          updateDoc(doc(db, "studentApplications", app.id), { 
            notified: true 
          })
        );

      await Promise.all(updatePromises);
      toast.success("All results published and notified!");
    } catch (error) {
      console.error("Error publishing all:", error);
      toast.error("Failed to publish results");
    }
  };

  const notifyOne = async (id) => {
    try {
      await updateDoc(doc(db, "studentApplications", id), { 
        notified: true 
      });
      toast.success("Student notified!");
    } catch (error) {
      console.error("Error notifying student:", error);
      toast.error("Failed to notify student");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return { icon: FaCheckCircle, color: "text-green-400", bg: "bg-green-900" };
      case "rejected":
        return { icon: FaTimesCircle, color: "text-red-400", bg: "bg-red-900" };
      default:
        return { icon: FaClock, color: "text-yellow-400", bg: "bg-yellow-900" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending Review";
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <InstituteSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-400" />
        </div>
      </div>
    );
  }

  const approvedApplications = applications.filter(app => app.status === "approved");
  const rejectedApplications = applications.filter(app => app.status === "rejected");
  const pendingApplications = applications.filter(app => app.status === "pending");

  const allApplications = [
    ...approvedApplications,
    ...rejectedApplications, 
    ...pendingApplications
  ];

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={localStorage.getItem("instituteName") || "Institute"} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admissions Management</h1>
              <p className="text-gray-400 text-sm mt-1">
                Publish and notify students about their application results
              </p>
            </div>
            <button
              onClick={publishAll}
              disabled={!applications.some(app => !app.notified && app.status !== "pending")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <FaPaperPlane /> Publish All Results
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-bold text-green-400">{approvedApplications.length}</div>
              <div className="text-sm text-gray-400">Approved</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-bold text-red-400">{rejectedApplications.length}</div>
              <div className="text-sm text-gray-400">Rejected</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
              <div className="text-2xl font-bold text-yellow-400">{pendingApplications.length}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {allApplications.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                <p className="text-gray-400">No applications to display</p>
                <p className="text-gray-500 text-sm mt-2">
                  Student applications will appear here once they apply to your programs
                </p>
              </div>
            ) : (
              allApplications.map(app => {
                const { icon: StatusIcon, color, bg } = getStatusIcon(app.status);
                
                return (
                  <motion.div
                    key={app.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${bg}`}>
                        <StatusIcon className={color} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{app.studentName}</h3>
                        <p className="text-sm text-gray-400">{app.programTitle}</p>
                        <div className="flex gap-2 mt-1">
                          {app.programType && (
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded capitalize">
                              {app.programType}
                            </span>
                          )}
                          {app.academicLevel && (
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              {app.academicLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        app.notified ? "bg-green-900 text-green-400" : "bg-gray-700 text-gray-400"
                      }`}>
                        {app.notified ? "Notified" : "Not sent"}
                      </span>
                      
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        app.status === "approved" ? "bg-green-900 text-green-400" :
                        app.status === "rejected" ? "bg-red-900 text-red-400" :
                        "bg-yellow-900 text-yellow-400"
                      }`}>
                        {getStatusText(app.status)}
                      </span>

                      {!app.notified && app.status !== "pending" && (
                        <button
                          onClick={() => notifyOne(app.id)}
                          className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                          title="Notify Student"
                        >
                          <FaPaperPlane />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default PublishAdmissions;