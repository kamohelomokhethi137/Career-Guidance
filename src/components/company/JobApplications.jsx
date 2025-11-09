// src/pages/company/Applications.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaDownload, FaEye } from "react-icons/fa";
import CompanySidebar from "./Sidebar";
import CompanyTopNav from "./TopNav";
import { toast, ToastContainer } from "react-toastify";

const applicants = [
  {
    id: 1, name: "Kamohelo Mokhethi", job: "Software Engineer",
    score: 92, match: "Excellent", gpa: 3.8, certs: 3, exp: "1 yr",
    ready: true
  },
  {
    id: 2, name: "Lerato Nthako", job: "Marketing Intern",
    score: 78, match: "Good", gpa: 3.5, certs: 1, exp: "None",
    ready: false
  },
];

const JobApplications = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "ready" ? applicants.filter(a => a.ready) : applicants;

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav companyName="Tech Solutions" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Job Applications</h1>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="all">All Applicants</option>
              <option value="ready">Interview Ready</option>
            </select>
          </div>

          <div className="space-y-4">
            {filtered.map(app => (
              <motion.div
                key={app.id}
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{app.name}</h3>
                    <p className="text-sm text-gray-400">{app.job}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-400">AI Score</p>
                      <p className="font-bold text-2xl">{app.score}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Match</p>
                      <p className={`font-medium ${app.match === "Excellent" ? "text-green-400" : "text-yellow-400"}`}>
                        {app.match}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-400">GPA: {app.gpa} • Certs: {app.certs} • Exp: {app.exp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {app.ready && <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-xs">Ready</span>}
                    <button className="p-2 bg-blue-600 rounded-lg"><FaEye /></button>
                    <button className="p-2 bg-gray-700 rounded-lg"><FaDownload /></button>
                  </div>
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

export default JobApplications;