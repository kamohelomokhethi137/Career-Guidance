import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBell, FaGraduationCap, FaBriefcase, FaExclamationTriangle, 
  FaCheckCircle, FaTrash, FaFilter 
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

// ── Notification Types ─────────────────────────────────────
const NOTIFICATION_TYPES = {
  admission: { icon: FaGraduationCap, color: "text-blue-400", bgColor: "bg-blue-900" },
  job: { icon: FaBriefcase, color: "text-green-400", bgColor: "bg-green-900" },
  reminder: { icon: FaExclamationTriangle, color: "text-yellow-400", bgColor: "bg-yellow-900" },
  system: { icon: FaBell, color: "text-purple-400", bgColor: "bg-purple-900" },
  success: { icon: FaCheckCircle, color: "text-green-400", bgColor: "bg-green-900" },
};

// ── Mock Notifications ─────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, type: "admission", title: "Application Accepted!", message: "Your application for BSc Computer Science at Limkokwing has been accepted.", time: "2024-01-20T10:30:00Z", read: false, actionUrl: "/student/admissions" },
  { id: 2, type: "job", title: "New Job Match", message: "Junior Developer at Tech Solutions matches your profile.", time: "2024-01-19T14:20:00Z", read: false, actionUrl: "/student/jobs" },
  { id: 3, type: "reminder", title: "Deadline Approaching", message: "Diploma in IT deadline in 3 days.", time: "2024-01-18T09:15:00Z", read: true, actionUrl: "/student/courses" },
  { id: 4, type: "admission", title: "Application Under Review", message: "BSc Business IT at NUL is under review.", time: "2024-01-17T16:45:00Z", read: true, actionUrl: "/student/admissions" },
  { id: 5, type: "success", title: "Document Verified", message: "Your transcript has been approved.", time: "2024-01-16T11:20:00Z", read: true, actionUrl: "/student/documents" },
];

// ── Helper Functions ──────────────────────────────────────
const formatTime = (iso) => {
  const diff = Date.now() - new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ── Reusable Components ───────────────────────────────────
const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const NotificationItem = ({ n, onMarkRead, onDelete, onAction }) => {
  const { icon: Icon, color, bgColor } = NOTIFICATION_TYPES[n.type];
  const isUnread = !n.read;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 rounded-xl border transition-all ${
        isUnread ? "bg-gray-900 border-blue-500" : "bg-gray-800 border-gray-700"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`text-lg ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-2">
            <h3 className={`font-semibold ${isUnread ? "text-white" : "text-gray-300"}`}>
              {n.title}
            </h3>
            <div className="flex items-center space-x-2">
              {isUnread && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              <button onClick={() => onDelete(n.id)} className="text-gray-400 hover:text-red-400 p-1">
                <FaTrash className="text-sm" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-3">{n.message}</p>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">{formatTime(n.time)}</span>
            <div className="flex gap-2">
              {isUnread && (
                <button onClick={() => onMarkRead(n.id)} className="text-blue-400 hover:text-blue-300">
                  Mark read
                </button>
              )}
              {n.actionUrl && (
                <button onClick={() => onAction(n)} className="bg-blue-600 text-white px-3 py-1 rounded">
                  View
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ filter }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
    <FaBell className="mx-auto text-4xl text-gray-600 mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">
      {filter === "all" ? "No notifications" : `No ${filter} notifications`}
    </h3>
    <p className="text-gray-400">{filter === "all" ? "You're all caught up!" : `Try changing your filter.`}</p>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────
export default function Notifications() {
  const currentUser = localStorage.getItem("currentUser") || "Student";

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "admission") return n.type === "admission";
    if (filter === "job") return n.type === "job";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    toast.success("Marked as read");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All marked as read");
  };

  const deleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Deleted");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("All cleared");
  };

  const handleAction = (n) => {
    toast.info(`Going to ${n.title}`);
    console.log("Navigate to:", n.actionUrl);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 md:ml-64 md:mt-10">
        <StudentTopNav studentName={currentUser} />

        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
              <p className="text-gray-400">Stay updated with your applications.</p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {unreadCount} unread
                </span>
              )}
              <div className="flex gap-2 text-sm">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-blue-400 hover:text-blue-300">
                    Mark all read
                  </button>
                )}
                <button onClick={clearAll} className="text-red-400 hover:text-red-300">
                  Clear all
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-3 flex-wrap">
            <FaFilter className="text-gray-400" />
            {[
              { label: "All", value: "all", count: notifications.length },
              { label: "Unread", value: "unread", count: unreadCount },
              { label: "Admissions", value: "admission" },
              { label: "Jobs", value: "job" },
            ].map((f) => (
              <FilterButton key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
                {f.label} {f.count !== undefined ? `(${f.count})` : ""}
              </FilterButton>
            ))}
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.length ? (
                filtered.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    onMarkRead={markRead}
                    onDelete={deleteNotif}
                    onAction={handleAction}
                  />
                ))
              ) : (
                <EmptyState filter={filter} />
              )}
            </AnimatePresence>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
}
