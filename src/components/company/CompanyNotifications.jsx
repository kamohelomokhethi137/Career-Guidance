// src/pages/company/Notifications.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaBell,FaUsers,FaBriefcase,    FaCheckCircle, FaClock, FaTrash, FaEye } from "react-icons/fa";
import CompanySidebar from "../../components/company/Sidebar";
import CompanyTopNav from "../../components/company/TopNav";
import { toast, ToastContainer } from "react-toastify";

const CompanyNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Applicant",
      message: "Kamohelo Mokhethi applied for Software Engineer",
      time: "2 mins ago",
      type: "application",
      read: false,
    },
    {
      id: 2,
      title: "Interview Ready",
      message: "3 applicants now ready for interview",
      time: "1 hour ago",
      type: "ready",
      read: false,
    },
    {
      id: 3,
      title: "Job Expired",
      message: "Marketing Intern posting has expired",
      time: "1 day ago",
      type: "job",
      read: true,
    },
    {
      id: 4,
      title: "System Update",
      message: "New AI scoring model deployed",
      time: "2 days ago",
      type: "system",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Marked as read");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notification removed");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <CompanySidebar />

      <div className="flex-1 md:ml-64">
        <CompanyTopNav companyName="Tech Solutions" />

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
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <FaCheckCircle /> Mark all as read
            </button>
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
              </motion.div>
            ) : (
              notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`p-4 rounded-xl border ${
                    notif.read
                      ? "bg-gray-900 border-gray-800"
                      : "bg-gray-800 border-yellow-600/50"
                  } flex items-start justify-between gap-4`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        notif.type === "application"
                          ? "bg-blue-900"
                          : notif.type === "ready"
                          ? "bg-green-900"
                          : notif.type === "job"
                          ? "bg-purple-900"
                          : "bg-gray-700"
                      }`}
                    >
                      {notif.type === "application" && <FaUsers className="text-blue-400" />}
                      {notif.type === "ready" && <FaCheckCircle className="text-green-400" />}
                      {notif.type === "job" && <FaBriefcase className="text-purple-400" />}
                      {notif.type === "system" && <FaBell className="text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${notif.read ? "text-gray-400" : "text-white"}`}>
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-400">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FaClock /> {notif.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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