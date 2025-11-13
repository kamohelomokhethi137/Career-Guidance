import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaBook, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import InstituteSidebar from "./Sidebar";
import InstituteTopNav from "./TopNav";
import { db } from "../../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";

const ManageCourses = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", faculty: "", duration: "", intake: "" });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoadingAuth(false);
  }, []);

  // Load courses
  useEffect(() => {
    if (!user) return setLoadingCourses(false);
    const q = query(collection(db, "courses"), where("instituteId", "==", localStorage.getItem("uid")));
    const unsubscribe = onSnapshot(q, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingCourses(false);
    }, () => {
      toast.error("Failed to load courses");
      setLoadingCourses(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!form.name || !form.faculty || !form.duration) return toast.error("Fill required fields");
    setSaving(true);
    const payload = { ...form, instituteId: localStorage.getItem("uid"), createdAt: serverTimestamp() };

    try {
      if (editingId) {
        await updateDoc(doc(db, "courses", editingId), { ...payload, updatedAt: serverTimestamp() });
        toast.success("Course updated!");
      } else {
        await addDoc(collection(db, "courses"), payload);
        toast.success("Course added!");
      }
      setForm({ name: "", faculty: "", duration: "", intake: "" });
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      toast.error("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      toast.success("Course deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center text-white">Checking login...</div>;

  if (!user) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center bg-gray-900 p-16 rounded-3xl">
        <h1 className="text-5xl font-bold mb-6">Demo Mode</h1>
        <p className="text-2xl mb-8">Please log in to manage courses</p>
        <a href="/login" className="bg-white text-black px-12 py-5 rounded-xl text-2xl font-bold">Login</a>
      </div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={user.institutionName || user.fullName || "Institute"} />
        <main className="pt-20 p-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-5xl font-bold flex items-center gap-4"><FaBook /> Manage Courses</h1>
            <button onClick={() => setShowForm(true)} className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition">
              <FaPlus /> Add Course
            </button>
          </div>

          {loadingCourses && <div className="text-center py-32"><FaSpinner className="animate-spin text-7xl" /></div>}

          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 p-10 rounded-2xl mb-10">
              <h2 className="text-3xl font-bold mb-6 text-center">{editingId ? "Edit" : "Add"} Course</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {["name","faculty","duration","intake"].map(f => (
                  <input
                    key={f}
                    placeholder={f.charAt(0).toUpperCase()+f.slice(1)+(f!=="intake"?" *":"")}
                    value={form[f]}
                    onChange={e => setForm({...form, [f]: e.target.value})}
                    className="p-3 bg-black border border-gray-700 rounded-lg"
                  />
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <button onClick={handleSave} disabled={saving} className="bg-white text-black px-6 py-2 rounded-lg font-bold">{saving ? "Saving..." : "Save"}</button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", faculty: "", duration: "", intake: "" }); }} className="bg-gray-700 px-6 py-2 rounded-lg font-bold">Cancel</button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {!loadingCourses && courses.length === 0 && (
              <div className="text-center py-20 bg-gray-900 rounded-2xl">
                <FaBook className="text-7xl mx-auto mb-4 opacity-30" />
                <p className="text-xl text-gray-400">No courses yet. Click "Add Course" to start.</p>
              </div>
            )}
            {courses.map(c => (
              <motion.div key={c.id} whileHover={{ scale: 1.02 }} className="bg-gray-900 p-6 rounded-2xl flex justify-between items-center shadow">
                <div>
                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="text-gray-300">{c.faculty} • {c.duration}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setForm(c); setEditingId(c.id); setShowForm(true); }}><FaEdit className="text-lg text-yellow-400 hover:text-yellow-300" /></button>
                  <button onClick={() => handleDelete(c.id)}><FaTrash className="text-lg text-red-400 hover:text-red-300" /></button>
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

export default ManageCourses;
