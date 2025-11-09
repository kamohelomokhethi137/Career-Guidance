import { useState } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane, FaCheck, FaClock } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { toast, ToastContainer } from "react-toastify";

const AdminAdmissions = () => {
  const [admissions, setAdmissions] = useState([
    { id: 1, institution: "Limkokwing", course: "BSc CS", students: 45, status: "published" },
    { id: 2, institution: "NUL", course: "Diploma IT", students: 32, status: "pending" },
  ]);

  const publishAll = () => {
    setAdmissions(prev => prev.map(a => ({ ...a, status: "published" })));
    toast.success("All admissions published!");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />
        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Publish Admissions</h1>
            <button onClick={publishAll} className="px-6 py-2 bg-green-600 rounded-lg flex items-center gap-2">
              <FaPaperPlane /> Publish All
            </button>
          </div>
          <div className="space-y-4">
            {admissions.map(admission => (
              <motion.div key={admission.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3>{admission.institution} - {admission.course}</h3>
                    <p className="text-sm text-gray-400">{admission.students} students</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    admission.status === "published" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"
                  }`}>
                    {admission.status}
                  </span>
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

export default AdminAdmissions;