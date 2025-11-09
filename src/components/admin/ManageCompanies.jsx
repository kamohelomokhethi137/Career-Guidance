import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaBan, FaTrash, FaEye } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { toast, ToastContainer } from "react-toastify";

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([
    { id: 1, name: "Tech Solutions Ltd", email: "hr@tech.com", status: "active", jobs: 4 },
    { id: 2, name: "ABC Corp", email: "jobs@abc.com", status: "pending", jobs: 0 },
    { id: 3, name: "Startup X", email: "info@startupx.com", status: "suspended", jobs: 2 },
  ]);

  const updateStatus = (id, status) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Company ${status}!`);
  };

  const deleteCompany = (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    toast.info("Company deleted");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Companies</h1>

          <div className="space-y-4">
            {companies.map(comp => (
              <motion.div
                key={comp.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold">{comp.name}</h3>
                  <p className="text-sm text-gray-400">{comp.email} • {comp.jobs} jobs posted</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    comp.status === "active" ? "bg-green-900 text-green-400" :
                    comp.status === "pending" ? "bg-yellow-900 text-yellow-400" :
                    "bg-red-900 text-red-400"
                  }`}>
                    {comp.status.toUpperCase()}
                  </span>

                  {comp.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(comp.id, "active")} className="p-2 bg-green-600 rounded-lg">
                        <FaCheck />
                      </button>
                      <button onClick={() => updateStatus(comp.id, "suspended")} className="p-2 bg-red-600 rounded-lg">
                        <FaBan />
                      </button>
                    </>
                  )}

                  {comp.status === "active" && (
                    <button onClick={() => updateStatus(comp.id, "suspended")} className="p-2 bg-red-600 rounded-lg">
                      <FaBan />
                    </button>
                  )}

                  {comp.status === "suspended" && (
                    <button onClick={() => updateStatus(comp.id, "active")} className="p-2 bg-green-600 rounded-lg">
                      <FaCheck />
                    </button>
                  )}

                  <button className="p-2 bg-blue-600 rounded-lg">
                    <FaEye />
                  </button>
                  <button onClick={() => deleteCompany(comp.id)} className="p-2 bg-gray-700 rounded-lg">
                    <FaTrash />
                  </button>
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

export default ManageCompanies;