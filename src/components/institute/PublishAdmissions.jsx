// src/pages/institute/Admissions.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaTimesCircle, FaPaperPlane } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";

const PublishAdmissions = () => {
  const [results, setResults] = useState([
    { id: 1, student: "Kamohelo Mokhethi", course: "BSc CS", status: "admitted", notified: true },
    { id: 2, student: "Lerato Nthako", course: "Diploma IT", status: "pending", notified: false },
    { id: 3, student: "Thabo Ramoepane", course: "BCom", status: "rejected", notified: true },
  ]);

  const publishAll = () => {
    setResults(prev => prev.map(r => ({ ...r, notified: true })));
    toast.success("All results published and notified!");
  };

  const notifyOne = (id) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, notified: true } : r));
    toast.success("Student notified!");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold">Publish Admissions</h1>
            <button
              onClick={publishAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
            >
              <FaPaperPlane /> Publish All
            </button>
          </div>

          <div className="grid gap-4">
            {results.map(res => (
              <motion.div
                key={res.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    res.status === "admitted" ? "bg-green-900" :
                    res.status === "rejected" ? "bg-red-900" : "bg-yellow-900"
                  }`}>
                    {res.status === "admitted" ? <FaCheckCircle className="text-green-400" /> :
                     res.status === "rejected" ? <FaTimesCircle className="text-red-400" /> :
                     <FaClock className="text-yellow-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{res.student}</h3>
                    <p className="text-sm text-gray-400">{res.course}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    res.notified ? "bg-green-900 text-green-400" : "bg-gray-700 text-gray-400"
                  }`}>
                    {res.notified ? "Notified" : "Not sent"}
                  </span>
                  {!res.notified && (
                    <button
                      onClick={() => notifyOne(res.id)}
                      className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <FaPaperPlane />
                    </button>
                  )}
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

export default PublishAdmissions;