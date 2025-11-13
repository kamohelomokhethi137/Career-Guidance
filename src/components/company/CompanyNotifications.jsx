import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBell, FaUsers, FaBriefcase, FaCheckCircle, FaClock, FaTrash, FaEye } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import CompanySidebar from "../../components/company/Sidebar";
import CompanyTopNav from "../../components/company/TopNav";

const CompanyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    setCompanyId(uid);

    if (!uid) return;

    // Listen for new job applications
    const appsQuery = query(
      collection(db, "jobApplications"), 
      where("companyId", "==", uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const newNotifications = snapshot.docChanges()
        .filter(change => change.type === 'added')
        .map(change => {
          const app = change.doc.data();
          return {
            id: change.doc.id,
            title: "New Job Application",
            message: `${app.studentName} applied for ${app.jobTitle}`,
            time: new Date(),
            type: "application",
            read: false,
            applicationId: change.doc.id
          };
        });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
        toast.info(`New application from ${newNotifications[0].message.split(' applied')[0]}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info("Notification removed");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("All notifications cleared");
  };

  const viewApplication = (appId) => {
    // Navigate to applications page or show details
    toast.info("Redirecting to applications...");
    window.location.href = "/company/applications";
  };

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-black min-h-screen text-white flex">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBell className="text-2xl text-yellow-400" />
              <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <FaCheckCircle /> Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <FaTrash /> Clear all
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <FaBell className="mx-auto text-4xl mb-3 text-gray-700" />
                <p>No notifications yet.</p>
                <p className="text-sm">You'll get notified when students apply to your jobs.</p>
              </motion.div>
            ) : (
              notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl border ${
                    notif.read
                      ? "bg-gray-900 border-gray-800"
                      : "bg-gray-800 border-yellow-600/50"
                  } flex items-start justify-between gap-4`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      notif.type === "application" ? "bg-blue-900" : "bg-gray-700"
                    }`}>
                      {notif.type === "application" ? 
                        <FaUsers className="text-blue-400" /> : 
                        <FaBell className="text-gray-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${notif.read ? "text-gray-400" : "text-white"}`}>
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-400">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaClock /> {formatTime(notif.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notif.type === "application" && (
                      <button
                        onClick={() => viewApplication(notif.applicationId)}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Application"
                      >
                        <FaEye />
                      </button>
                    )}
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Mark as read"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default CompanyNotifications;