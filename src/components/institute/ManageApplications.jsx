import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaSpinner, FaUniversity } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InstituteSidebar from "./Sidebar";
import InstituteTopNav from "./TopNav";
import { db } from "../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";

const ManageApplications = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    requirements: "", 
    deadline: "", 
    programType: "",
    academicLevel: ""
  });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setLoadingAuth(false);
  }, []);

  // Load applications for this institute
  useEffect(() => {
    if (!user) {
      setLoadingApplications(false);
      return;
    }
    
    const instituteId = localStorage.getItem("uid");
    if (!instituteId) {
      setLoadingApplications(false);
      return;
    }

    const q = query(
      collection(db, "universityApplications"), 
      where("instituteId", "==", instituteId)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setApplications(apps);
        setLoadingApplications(false);
      }, 
      (error) => {
        console.error("Error loading applications:", error);
        toast.error("Failed to load applications");
        setLoadingApplications(false);
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!form.title || !form.description || !form.deadline) {
      return toast.error("Please fill in required fields (Title, Description, Deadline)");
    }

    setSaving(true);
    const instituteId = localStorage.getItem("uid");
    const instituteName = user?.institutionName || user?.fullName || "Unknown Institute";

    const payload = { 
      ...form, 
      instituteId: instituteId,
      instituteName: instituteName, // Automatically include institute name
      createdAt: serverTimestamp(),
      status: "active",
      applicationCount: 0 // Track how many students apply
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "universityApplications", editingId), { 
          ...payload, 
          updatedAt: serverTimestamp() 
        });
        toast.success("Application updated successfully!");
      } else {
        await addDoc(collection(db, "universityApplications"), payload);
        toast.success("Application published successfully!");
      }
      
      // Reset form
      setForm({ 
        title: "", 
        description: "", 
        requirements: "", 
        deadline: "", 
        programType: "",
        academicLevel: ""
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save application: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application? Students will no longer see it.")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "universityApplications", id));
      toast.success("Application deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete application");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No deadline";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <FaSpinner className="animate-spin text-4xl mr-4" />
        Checking login...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-16 rounded-3xl">
          <h1 className="text-5xl font-bold mb-6">Demo Mode</h1>
          <p className="text-2xl mb-8">Please log in to manage applications</p>
          <a href="/login" className="bg-white text-black px-12 py-5 rounded-xl text-2xl font-bold">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={user.institutionName || user.fullName || "Institute"} />
        <main className="pt-20 p-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-5xl font-bold flex items-center gap-4">
              <FaUniversity /> Manage Applications
            </h1>
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition"
            >
              <FaPlus /> Publish Application
            </button>
          </div>

          {loadingApplications && (
            <div className="text-center py-32">
              <FaSpinner className="animate-spin text-7xl mx-auto" />
              <p className="mt-4 text-xl">Loading applications...</p>
            </div>
          )}

          {/* Application Form */}
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-8 rounded-2xl mb-10 border border-gray-700"
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                {editingId ? "Edit Application" : "Publish New Application"}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input
                    placeholder="Application Title *"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition"
                  />
                  <select
                    value={form.programType}
                    onChange={e => setForm({...form, programType: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition"
                  >
                    <option value="">Select Program Type</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="diploma">Diploma</option>
                    <option value="certificate">Certificate</option>
                    <option value="phd">PhD</option>
                  </select>
                  <input
                    placeholder="Academic Level (e.g., Bachelor's, Master's)"
                    value={form.academicLevel}
                    onChange={e => setForm({...form, academicLevel: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition"
                  />
                </div>
                <div className="space-y-4">
                  <input
                    type="datetime-local"
                    placeholder="Application Deadline *"
                    value={form.deadline}
                    onChange={e => setForm({...form, deadline: e.target.value})}
                    className="w-full p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition"
                  />
                  <textarea
                    placeholder="Requirements (separate with commas)"
                    value={form.requirements}
                    onChange={e => setForm({...form, requirements: e.target.value})}
                    rows="3"
                    className="w-full p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition resize-none"
                  />
                </div>
              </div>
              <textarea
                placeholder="Detailed Description *"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows="4"
                className="w-full mt-4 p-4 bg-black border border-gray-700 rounded-lg focus:border-white transition resize-none"
              />
              
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-white text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaFileAlt />}
                  {saving ? "Saving..." : (editingId ? "Update" : "Publish")}
                </button>
                <button 
                  onClick={() => { 
                    setShowForm(false); 
                    setEditingId(null); 
                    setForm({ 
                      title: "", 
                      description: "", 
                      requirements: "", 
                      deadline: "", 
                      programType: "",
                      academicLevel: ""
                    }); 
                  }} 
                  className="bg-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Applications List */}
          <div className="space-y-6">
            {!loadingApplications && applications.length === 0 && (
              <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
                <FaFileAlt className="text-7xl mx-auto mb-4 opacity-30" />
                <p className="text-xl text-gray-400 mb-2">No applications published yet.</p>
                <p className="text-gray-500">Click "Publish Application" to create your first application.</p>
              </div>
            )}
            
            {applications.map(app => (
              <motion.div 
                key={app.id} 
                whileHover={{ scale: 1.01 }}
                className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">{app.title}</h3>
                      <span className="bg-green-500 text-black px-2 py-1 rounded text-sm font-bold">
                        {app.status || "active"}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{app.description}</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-400">Program Type:</strong>
                        <p className="capitalize">{app.programType || "Not specified"}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400">Academic Level:</strong>
                        <p>{app.academicLevel || "Not specified"}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400">Deadline:</strong>
                        <p className={new Date(app.deadline) < new Date() ? "text-red-400" : "text-green-400"}>
                          {formatDate(app.deadline)}
                        </p>
                      </div>
                    </div>
                    
                    {app.requirements && (
                      <div className="mt-4">
                        <strong className="text-gray-400">Requirements:</strong>
                        <p className="text-gray-300">{app.requirements}</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      Published: {app.createdAt ? formatDate(app.createdAt) : "Recently"}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 ml-4">
                    <button 
                      onClick={() => { 
                        setForm(app); 
                        setEditingId(app.id); 
                        setShowForm(true); 
                      }}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                      title="Edit application"
                    >
                      <FaEdit className="text-yellow-400" />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                      title="Delete application"
                    >
                      <FaTrash className="text-red-400" />
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

export default ManageApplications;