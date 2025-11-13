import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaBookmark, FaRegBookmark, FaCheckCircle } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

export default function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "Student" });
  const [uid, setUid] = useState(null);

  // Load user data
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const storedUid = localStorage.getItem("uid");
      setUser(storedUser);
      setUid(storedUid);
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);
    return () => window.removeEventListener("userUpdated", loadUser);
  }, []);

  // Load jobs from Firestore
  useEffect(() => {
    const q = query(collection(db, "jobs"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
      if (jobsData.length > 0 && !selected) setSelected(jobsData[0]);
    });
    return () => unsubscribe();
  }, []);

  // Load user's job applications
  useEffect(() => {
    if (!uid) return;

    const appsQuery = query(collection(db, "jobApplications"), where("studentId", "==", uid));
    const unsubscribe = onSnapshot(appsQuery, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(appsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const filtered = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const apply = async (job) => {
    if (!uid) return toast.error("Please log in to apply");
    
    // Check if already applied
    const existingApp = applications.find(app => app.jobId === job.id);
    if (existingApp) return toast.info("You've already applied to this job");

    try {
      await addDoc(collection(db, "jobApplications"), {
        jobId: job.id,
        studentId: uid,
        studentName: user.name || user.fullName || "Student",
        companyId: job.companyId,
        companyName: job.companyName,
        jobTitle: job.title,
        status: "pending",
        appliedAt: serverTimestamp()
      });
      toast.success("Application submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply");
    }
  };

  const toggleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(saved.includes(id) ? "Removed from saved" : "Job saved!");
  };

  const getApplicationStatus = (jobId) => {
    const application = applications.find(app => app.jobId === jobId);
    return application ? application.status : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-900 text-green-400";
      case "rejected": return "bg-red-900 text-red-400";
      case "pending": return "bg-yellow-900 text-yellow-400";
      default: return "bg-gray-800 text-gray-400";
    }
  };

  if (loading) return (
    <div className="bg-black min-h-screen text-white flex">
      <StudentSidebar />
      <div className="flex-1 md:ml-64 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white flex">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.name || user.fullName || "Student"} />

        <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 mt-16">
          <div>
            <h1 className="text-2xl font-bold">Job Opportunities</h1>
            <p className="text-gray-400">{filtered.length} jobs found</p>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 rounded-lg"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Job List */}
            <div className="lg:col-span-1 space-y-2">
              {filtered.map(job => {
                const status = getApplicationStatus(job.id);
                const isApplied = !!status;

                return (
                  <motion.div
                    key={job.id}
                    onClick={() => setSelected(job)}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selected?.id === job.id ? "bg-blue-900 border-blue-500" : "bg-gray-900 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-blue-400 text-sm">{job.companyName}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}>
                        {saved.includes(job.id) ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <FaMapMarkerAlt /> {job.location}
                      <FaBriefcase /> {job.type}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{job.salary}</span>
                      {isApplied ? (
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>
                          {status === "approved" && <FaCheckCircle className="inline mr-1" />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); apply(job); }}
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Job Details */}
            <div className="lg:col-span-2">
              {selected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 p-4 rounded-xl">
                  <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
                  <p className="text-blue-400 mb-4">{selected.companyName} • {selected.location}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><strong>Salary:</strong> {selected.salary}</div>
                    <div><strong>Type:</strong> {selected.type}</div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{selected.description}</p>
                  </div>

                  {selected.qualifications && selected.qualifications.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Qualifications</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {selected.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                      </ul>
                    </div>
                  )}

                  {selected.requirements && selected.requirements.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside text-gray-300">
                        {selected.requirements.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSave(selected.id)}
                      className={`flex-1 py-2 rounded ${
                        saved.includes(selected.id) ? "bg-yellow-900 text-yellow-400" : "bg-gray-800"
                      }`}
                    >
                      {saved.includes(selected.id) ? "Saved" : "Save"}
                    </button>
                    
                    {getApplicationStatus(selected.id) ? (
                      <button className={`flex-1 py-2 rounded ${getStatusColor(getApplicationStatus(selected.id))}`}>
                        {getApplicationStatus(selected.id) === "approved" && <FaCheckCircle className="inline mr-2" />}
                        {getApplicationStatus(selected.id).charAt(0).toUpperCase() + getApplicationStatus(selected.id).slice(1)}
                      </button>
                    ) : (
                      <button
                        onClick={() => apply(selected)}
                        className="flex-1 py-2 rounded bg-blue-600 text-white"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
}