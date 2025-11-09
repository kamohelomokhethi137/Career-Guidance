import { useState } from "react";
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaEye } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { toast, ToastContainer } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Kamohelo Mokhethi", email: "kamo@example.com", role: "student", institution: "Limkokwing", status: "active", registered: "2024-01-15" },
    { id: 2, name: "Lerato Nthako", email: "lerato@ nul.ls", role: "student", institution: "NUL", status: "pending", registered: "2024-01-20" },
  ]);

  const updateStatus = (id, status) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    toast.success(`User ${status}!`);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />
        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Monitor Users ({users.length})</h1>
          <div className="space-y-4">
            {users.map(user => (
              <motion.div key={user.id} whileHover={{ scale: 1.01 }} className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.email} • {user.role} • {user.institution}</p>
                  <p className="text-xs text-gray-500">Registered: {user.registered}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.status === "active" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"
                  }`}>
                    {user.status}
                  </span>
                  <button onClick={() => updateStatus(user.id, "active")} className="p-2 bg-green-600 rounded-lg">
                    <FaUserCheck />
                  </button>
                  <button className="p-2 bg-blue-600 rounded-lg"><FaEye /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AdminUsers;