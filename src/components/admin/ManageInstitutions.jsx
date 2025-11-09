// src/pages/admin/Institutions.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaUniversity } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { toast, ToastContainer } from "react-toastify";

const ManageInstitutions = () => {
  const [institutions, setInstitutions] = useState([
    { id: 1, name: "Limkokwing University", location: "Maseru", students: 890, status: "active" },
    { id: 2, name: "National University of Lesotho", location: "Roma", students: 1200, status: "active" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "" });

  const handleAdd = () => {
    if (form.name && form.location) {
      setInstitutions(prev => [...prev, { id: Date.now(), ...form, students: 0, status: "active" }]);
      setForm({ name: "", location: "" });
      setShowForm(false);
      toast.success("Institution added!");
    }
  };

  const handleDelete = (id) => {
    setInstitutions(prev => prev.filter(i => i.id !== id));
    toast.info("Institution removed");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FaUniversity /> Manage Institutions
            </h1>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg">
              <FaPlus /> Add Institution
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-6">
              <input placeholder="Institution Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mb-3 px-3 py-2 bg-gray-800 rounded-lg" />
              <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full mb-3 px-3 py-2 bg-gray-800 rounded-lg" />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="px-4 py-2 bg-green-600 rounded-lg">Save</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {institutions.map(inst => (
              <div key={inst.id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{inst.name}</h3>
                  <p className="text-sm text-gray-400">{inst.location} • {inst.students} students</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-400"><FaEdit /></button>
                  <button onClick={() => handleDelete(inst.id)} className="text-red-400"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <ToastContainer />
      </div>
    </div>
  );
};

export default ManageInstitutions;