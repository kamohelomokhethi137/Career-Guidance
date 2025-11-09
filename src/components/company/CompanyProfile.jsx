// src/pages/company/Profile.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaBuilding, FaUsers,FaBriefcase , FaEnvelope, FaPhone, FaGlobe, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import CompanySidebar from "./Sidebar";
import CompanyTopNav from "./TopNav";
import { toast, ToastContainer } from "react-toastify";

const CompanyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Tech Solutions Ltd",
    email: "hr@techsolutions.com",
    phone: "+266 1234 5678",
    website: "https://techsolutions.com",
    industry: "Software Development",
    about: "We build innovative software for the future.",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated!");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <CompanySidebar />
      <div className="flex-1 md:ml-64">
        <CompanyTopNav companyName={profile.name} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Company Profile</h1>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-700 rounded-lg flex items-center gap-2"><FaTimes /> Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded-lg flex items-center gap-2"><FaSave /> Save</button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2"><FaEdit /> Edit</button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {["name", "email", "phone", "website", "industry"].map(field => (
                <div key={field}>
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    {field === "name" && <FaBuilding />}
                    {field === "email" && <FaEnvelope />}
                    {field === "phone" && <FaPhone />}
                    {field === "website" && <FaGlobe />}
                    {field === "industry" && <FaBriefcase />}
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    name={field}
                    value={profile[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60"
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400">About</label>
                <textarea
                  name="about"
                  value={profile.about}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60 resize-none"
                />
              </div>
            </div>
          </motion.div>
        </main>

        <ToastContainer />
      </div>
    </div>
  );
};

export default CompanyProfile;