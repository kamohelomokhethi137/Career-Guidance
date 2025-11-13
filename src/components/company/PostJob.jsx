import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import CompanySidebar from "./Sidebar";
import CompanyTopNav from "./TopNav";

const PostJob = () => {
  const [job, setJob] = useState({
    title: "", type: "full-time", location: "", salary: "",
    qualifications: [""], requirements: [""], description: ""
  });
  const [loading, setLoading] = useState(false);

  const addItem = (field) => setJob(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  const updateItem = (field, index, value) => setJob(prev => ({ ...prev, [field]: prev[field].map((v,i)=>i===index?value:v) }));
  const removeItem = (field, index) => setJob(prev => ({ ...prev, [field]: prev[field].filter((_,i)=>i!==index) }));

  const handleSubmit = async () => {
    if (!job.title || !job.description) return toast.error("Title and description required.");

    setLoading(true);
    try {
      const companyId = localStorage.getItem("uid");
      const companyName = JSON.parse(localStorage.getItem("user") || "{}").fullName || "Company";

      await addDoc(collection(db, "jobs"), {
        ...job,
        companyId,
        companyName,
        createdAt: serverTimestamp(),
        status: "active"
      });

      toast.success("Job posted successfully!");
      setJob({ title: "", type: "full-time", location: "", salary: "", qualifications: [""], requirements: [""], description: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white flex">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Post New Job</h1>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <input placeholder="Job Title" value={job.title} onChange={e=>setJob({...job,title:e.target.value})} className="w-full px-4 py-3 bg-gray-800 rounded-lg" />

            <div className="grid md:grid-cols-3 gap-4">
              <select value={job.type} onChange={e=>setJob({...job,type:e.target.value})} className="px-4 py-3 bg-gray-800 rounded-lg">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
              </select>
              <input placeholder="Location" value={job.location} onChange={e=>setJob({...job,location:e.target.value})} className="px-4 py-3 bg-gray-800 rounded-lg" />
              <input placeholder="Salary Range" value={job.salary} onChange={e=>setJob({...job,salary:e.target.value})} className="px-4 py-3 bg-gray-800 rounded-lg" />
            </div>

            {/* Qualifications */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Qualifications</label>
                <button onClick={()=>addItem("qualifications")} className="text-blue-400"><FaPlus /></button>
              </div>
              {job.qualifications.map((q,i)=>(
                <div key={i} className="flex gap-2 mb-2">
                  <input value={q} onChange={e=>updateItem("qualifications",i,e.target.value)} className="flex-1 px-3 py-2 bg-gray-800 rounded-lg" />
                  <button onClick={()=>removeItem("qualifications",i)} className="text-red-400"><FaTrash /></button>
                </div>
              ))}
            </div>

            {/* Requirements */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Requirements</label>
                <button onClick={()=>addItem("requirements")} className="text-blue-400"><FaPlus /></button>
              </div>
              {job.requirements.map((r,i)=>(
                <div key={i} className="flex gap-2 mb-2">
                  <input value={r} onChange={e=>updateItem("requirements",i,e.target.value)} className="flex-1 px-3 py-2 bg-gray-800 rounded-lg" />
                  <button onClick={()=>removeItem("requirements",i)} className="text-red-400"><FaTrash /></button>
                </div>
              ))}
            </div>

            <textarea placeholder="Job Description" value={job.description} onChange={e=>setJob({...job,description:e.target.value})} rows="5" className="w-full px-4 py-3 bg-gray-800 rounded-lg resize-none" />

            <button onClick={handleSubmit} disabled={loading} className="w-full py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Posting..." : "Post Job"}
            </button>
          </motion.div>
        </main>

        <ToastContainer />
      </div>
    </div>
  );
};

export default PostJob;
