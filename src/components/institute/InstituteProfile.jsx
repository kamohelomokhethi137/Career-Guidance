// src/pages/institute/Profile.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";

const InstituteProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Limkokwing University",
    email: "admin@limkokwing.ls",
    phone: "+266 2231 4567",
    website: "https://limkokwing.ls",
    address: "Maseru, Lesotho",
    about: "Leading creative technology university in Lesotho.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName={profile.name} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Institution Profile</h1>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-700 rounded-lg flex items-center gap-2">
                  <FaTimes /> Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded-lg flex items-center gap-2">
                  <FaSave /> Save
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2">
                <FaEdit /> Edit
              </button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2"><FaBuilding /> Name</label>
                <input
                  name="name" value={profile.name} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2"><FaEnvelope /> Email</label>
                <input
                  name="email" value={profile.email} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2"><FaPhone /> Phone</label>
                <input
                  name="phone" value={profile.phone} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2"><FaGlobe /> Website</label>
                <input
                  name="website" value={profile.website} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400">Address</label>
                <input
                  name="address" value={profile.address} onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400">About</label>
                <textarea
                  name="about" value={profile.about} onChange={handleChange}
                  disabled={!isEditing} rows="4"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60 resize-none"
                />
              </div>
            </div>
          </motion.div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default InstituteProfile;