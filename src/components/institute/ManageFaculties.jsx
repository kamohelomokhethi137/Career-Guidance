// src/pages/institute/Faculties.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([
    { id: 1, name: "Faculty of ICT", dean: "Dr. John Doe", departments: 5 },
    { id: 2, name: "Faculty of Business", dean: "Prof. Jane Smith", departments: 4 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dean: "" });

  const handleAdd = () => {
    if (form.name && form.dean) {
      setFaculties(prev => [...prev, { id: Date.now(), ...form, departments: 0 }]);
      setForm({ name: "", dean: "" });
      setShowForm(false);
      toast.success("Faculty added!");
    }
  };

  const handleDelete = (id) => {
    setFaculties(prev => prev.filter(f => f.id !== id));
    toast.info("Faculty removed");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Manage Faculties</h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg"
            >
              <FaPlus /> Add Faculty
            </button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6"
            >
              <input
                placeholder="Faculty Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full mb-3 px-3 py-2 bg-gray-800 rounded-lg"
              />
              <input
                placeholder="Dean Name"
                value={form.dean}
                onChange={e => setForm({ ...form, dean: e.target.value })}
                className="w-full mb-3 px-3 py-2 bg-gray-800 rounded-lg"
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="px-4 py-2 bg-green-600 rounded-lg">Save</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
              </div>
            </motion.div>
          )}

          <div className="grid gap-4">
            {faculties.map(f => (
              <div key={f.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="text-sm text-gray-400">Dean: {f.dean} • {f.departments} Departments</p>
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