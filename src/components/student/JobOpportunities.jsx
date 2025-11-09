import { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaBookmark, FaRegBookmark, FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

// Mock data
const jobs = [
  { id: 1, title: "Junior Developer", company: "Tech Solutions", location: "Maseru", salary: "M8k–M12k", type: "Full-time", match: 95 },
  { id: 2, title: "IT Support", company: "Bank of Lesotho", location: "Maseru", salary: "M10k–M15k", type: "Full-time", match: 78 },
  { id: 3, title: "Data Intern", company: "Lesotho Stats", location: "Roma", salary: "M5k–M7k", type: "Internship", match: 85 },
];

export default function JobOpportunities() {
  const currentUser = localStorage.getItem("currentUser") || "Student";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(jobs[0]);
  const [savedJobs, setSavedJobs] = useState([2]);
  const [appliedJobs, setAppliedJobs] = useState([2]);

  const filtered = jobs.filter(
    (j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSave = (id) => {
    const isSaved = savedJobs.includes(id);
    setSavedJobs(isSaved ? savedJobs.filter((x) => x !== id) : [...savedJobs, id]);
    toast.success(isSaved ? "Removed from saved" : "Job saved!");
  };

  const apply = (id) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs([...appliedJobs, id]);
      toast.success("Applied successfully!");
    }
  };

  const getMatchColor = (score) =>
    score >= 90 ? "bg-green-900 text-green-400" : score >= 80 ? "bg-blue-900 text-blue-400" : "bg-gray-800 text-gray-400";

  // Reusable Job Card
  const JobCard = ({ job }) => {
    const isSaved = savedJobs.includes(job.id);
    const isApplied = appliedJobs.includes(job.id);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelected(job)}
        className={`p-4 rounded-lg cursor-pointer transition-all border ${
          selected.id === job.id
            ? "bg-blue-900 border-blue-500"
            : "bg-gray-900 border-transparent hover:border-gray-700"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm md:text-base">{job.title}</h3>
          <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}>
            {isSaved ? <FaBookmark className="text-yellow-500" /> : <FaRegBookmark className="text-gray-500" />}
          </button>
        </div>
        <p className="text-xs md:text-sm text-blue-400">{job.company}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
          <span className="flex items-center"><FaMapMarkerAlt className="mr-1" />{job.location}</span>
          <span className="flex items-center"><FaBriefcase className="mr-1" />{job.type}</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchColor(job.match)}`}>{job.match}% Match</span>
          <button
            onClick={(e) => { e.stopPropagation(); apply(job.id); }}
            disabled={isApplied}
            className={`text-xs px-3 py-1 rounded font-medium transition-colors ${isApplied ? "bg-green-900 text-green-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {isApplied ? "Applied" : "Apply"}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 md:ml-64 md:mt-10">
        <StudentTopNav studentName={currentUser} />

        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Job Opportunities</h1>
            <p className="text-gray-400">{filtered.length} jobs found</p>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3.5 text-gray-500" />
            <input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBriefcase className="mx-auto text-4xl mb-3" />
                  <p>No jobs match your search.</p>
                </div>
              ) : (
                filtered.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            <div className="lg:col-span-2">
              {selected && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900 p-5 md:p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold">{selected.title}</h2>
                      <p className="text-blue-400 text-sm md:text-base">{selected.company} • {selected.location}</p>
                    </div>
                    <FaStar className="text-2xl md:text-3xl text-yellow-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                    <div><strong>Salary:</strong> {selected.salary}</div>
                    <div><strong>Type:</strong> {selected.type}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleSave(selected.id)}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${savedJobs.includes(selected.id) ? "bg-yellow-900 text-yellow-400" : "bg-gray-800 hover:bg-gray-700"}`}
                    >
                      {savedJobs.includes(selected.id) ? "Saved" : "Save Job"}
                    </button>
                    <button
                      onClick={() => apply(selected.id)}
                      disabled={appliedJobs.includes(selected.id)}
                      className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${appliedJobs.includes(selected.id) ? "bg-green-900 text-green-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {appliedJobs.includes(selected.id) ? "Applied" : "Apply Now"}
                    </button>
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
