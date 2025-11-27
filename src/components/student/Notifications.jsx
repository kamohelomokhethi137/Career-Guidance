import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaGraduationCap, FaTrash, FaFilter } from "react-icons/fa";
import { collection, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

const formatTime = (timestamp) => {
  if (!timestamp) return "Recently";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  // Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setUser(storedUser);
      setUid(localStorage.getItem("uid"));
    }
  }, []);

  // Load application status updates
  useEffect(() => {
    if (!uid) return;

    const appsQuery = query(
      collection(db, "studentApplications"),
      where("studentId", "==", uid),
      orderBy("appliedAt", "desc")
    );

    return onSnapshot(appsQuery, (snapshot) => {
      const appNotifications = snapshot.docs.map(doc => {
        const app = doc.data();
        
        let title = "";
        let message = "";
        
        switch(app.status) {
          case "approved":
            title = "Application Approved";
            message = `Your application to ${app.instituteName} has been approved`;
            break;
          case "rejected":
            title = "Application Not Successful";
            message = `Your application to ${app.instituteName} was not accepted`;
            break;
          case "admitted":
            title = "Admission Confirmed";
            message = `You are now admitted to ${app.instituteName}`;
            break;
          default:
            title = "Application Submitted";
            message = `Application sent to ${app.instituteName}`;
        }

        return {
          id: doc.id,
          type: "admission",
          title: title,
          message: message,
          program: app.programTitle,
          institute: app.instituteName,
          time: app.appliedAt,
          status: app.status,
          read: false,
        };
      });

      setNotifications(appNotifications);
    });
  }, [uid]);

  // Filter notifications
  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.status === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <a href="/login" className="bg-white text-black px-6 py-3 rounded-lg font-bold">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.fullName || "Student"} />

        <main className="p-6 max-w-2xl mx-auto mt-16 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center bg-gray-900 rounded-xl p-4">
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-gray-400">Application status updates</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-xl p-3 flex gap-2">
            {["all", "approved", "rejected", "admitted"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm capitalize ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.status === 'approved' ? 'bg-green-900' :
                        notification.status === 'rejected' ? 'bg-red-900' :
                        notification.status === 'admitted' ? 'bg-blue-900' : 'bg-gray-800'
                      }`}>
                        <FaGraduationCap className={
                          notification.status === 'approved' ? 'text-green-400' :
                          notification.status === 'rejected' ? 'text-red-400' :
                          notification.status === 'admitted' ? 'text-blue-400' : 'text-gray-400'
                        } />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        <p className="text-gray-400 text-sm">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatTime(notification.time)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No {filter === "all" ? "" : filter} notifications
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}