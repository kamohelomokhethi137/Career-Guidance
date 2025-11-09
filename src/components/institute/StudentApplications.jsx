// src/pages/institute/Applications.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaCheck, FaTimes, FaDownload } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";

const StudentApplications = () => {
  const [applications, setApplications] = useState([
    { id: 1, student: "Kamohelo Mokhethi", course: "BSc CS", status: "pending", date: "2024-01-20", docs: 3 },
    { id: 2, student: "Lerato Nthako", course: "Diploma IT", status: "pending", date: "2024-01-19", docs: 2 },
    { id: 3, student: "Thabo Ramoepane", course: "BCom", status: "admitted", date: "2024-01-18", docs: 4 },
  ]);

  const updateStatus = (id, status) => {
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, status } : app
    ));
    toast.success(`Application ${status}!`);
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Student Applications</h1>

          <div className="space-y-4">
            {applications.map(app => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{app.student}</h3>
                    <p className="text-sm text-gray-400">
                      {app.course} • Applied: {app.date} • {app.docs} docs
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === "admitted" ? "bg-green-900 text-green-400" :
                      app.status === "rejected" ? "bg-red-900 text-red-400" :
                      "bg-yellow-900 text-yellow-400"
                    }`}>
                      {app.status.toUpperCase()}
                    </span>

                    {app.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "admitted")}
                          className="p-2 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "rejected")}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}

                    <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                      <FaEye />
                    </button>
                    <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                      <FaDownload />
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