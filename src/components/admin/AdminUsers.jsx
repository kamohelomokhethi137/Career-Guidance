import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUserCheck, FaUserTimes, FaEye } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "users", id), { status });
      toast.success(`User ${status}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav />
        
        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Monitor Users ({users.length})</h1>
          
          <div className="space-y-4">
            {users.map(user => (
              <motion.div 
                key={user.id} 
                whileHover={{ scale: 1.01 }} 
                className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{user.name || user.fullName || "No Name"}</h3>
                  <p className="text-sm text-gray-400">
                    {user.email} • {user.role} • {user.institutionName || "No Institution"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Registered: {user.createdAt?.toDate?.().toLocaleDateString() || "Unknown"}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    user.status === "active" ? "bg-green-900 text-green-400" : 
                    user.status === "pending" ? "bg-yellow-900 text-yellow-400" : 
                    "bg-red-900 text-red-400"
                  }`}>
                    {user.status || "pending"}
                  </span>
                  
                  {user.status !== "active" && (
                    <button 
                      onClick={() => updateStatus(user.id, "active")} 
                      className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <FaUserCheck />
                    </button>
                  )}
                  
                  {user.status === "active" && (
                    <button 
                      onClick={() => updateStatus(user.id, "suspended")} 
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <FaUserTimes />
                    </button>
                  )}
                  
                  <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    <FaEye />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default AdminUsers;