// src/pages/institute/Faculties.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dean: "" });

  const facultyRef = collection(db, "faculties");

  const fetchFaculties = async () => {
    const snapshot = await getDocs(facultyRef);
    setFaculties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.dean) return toast.error("All fields required");
    await addDoc(facultyRef, { name: form.name, dean: form.dean, departments: 0 });
    toast.success("Faculty added");
    setForm({ name: "", dean: "" });
    setShowForm(false);
    fetchFaculties();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "faculties", id));
    toast.info("Faculty deleted");
    fetchFaculties();
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing" />

        <main className="pt-20 px-6">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Manage Faculties</h1>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
              <FaPlus /> Add
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-4 rounded-lg mb-4">
              <input
                placeholder="Faculty Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mb-3 p-2 bg-gray-800 rounded"
              />
              <input
                placeholder="Dean Name"
                value={form.dean}
                onChange={e => setForm({ ...form, dean: e.target.value })}
                className="w-full mb-3 p-2 bg-gray-800 rounded"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="bg-green-600 px-4 py-2 rounded">Save</button>
                <button onClick={() => setShowForm(false)} className="bg-gray-700 px-4 py-2 rounded">Cancel</button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {faculties.map(f => (
              <div key={f.id} className="bg-gray-900 p-4 rounded-lg flex justify-between">
                <div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="text-sm text-gray-400">Dean: {f.dean}</p>
                </div>
                <button onClick={() => handleDelete(f.id)} className="text-red-400 hover:text-red-300">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ManageFaculties;
