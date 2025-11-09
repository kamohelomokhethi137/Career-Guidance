// src/pages/student/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaGraduationCap, FaUpload, FaFilePdf, FaTrash,
  FaEdit, FaSave, FaTimes, FaCamera,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import api from "../../api/api"; // <-- NEW: Auto-token API

import StudentSidebar from "../../components/student/Sidebar";
import StudentTopNav from "../../components/student/TopNav";

import { auth, db } from "../../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

/* --------------------------------------------------------------- */
/* ── Reusable UI ------------------------------------------------ */
/* --------------------------------------------------------------- */
const InputField = ({ label, icon, disabled, ...props }) => (
  <div>
    <label className="text-sm text-gray-400 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      disabled={disabled}
      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-60"
      {...props}
    />
  </div>
);

const FileList = ({ items, isEditing, onDelete, IconComponent }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
      >
        <div className="flex items-center gap-3">
          {IconComponent && <IconComponent className="text-red-400" />}
          <div>
            <p className="font-medium text-sm">{item.name}</p>
            {item.uploaded && (
              <p className="text-xs text-gray-500">
                Uploaded: {item.uploaded}
              </p>
            )}
            {item.issuer && (
              <p className="text-xs text-gray-400">
                {item.issuer} • {new Date(item.date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {isEditing && (
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-400 hover:text-red-300"
          >
            <FaTrash />
          </button>
        )}
      </div>
    ))}
  </div>
);

/* --------------------------------------------------------------- */
/* ── Main Component --------------------------------------------- */
/* --------------------------------------------------------------- */
const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState({});
  const [profile, setProfile] = useState({
    name: "User",
    email: "",
    phone: "",
    address: "",
    institution: "",
    program: "",
    year: "",
    bio: "",
    avatar: null,
  });

  const [documents, setDocuments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "" });

  const uid = auth.currentUser?.uid;

  /* ----------------------------------------------------------- */
  /* ── Real-time profile sync + auto-create ------------------- */
  /* ----------------------------------------------------------- */
  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || "User",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            institution: data.institution || "",
            program: data.program || "",
            year: data.year || "",
            bio: data.bio || "",
            avatar: data.avatar || null,
          });
          setDocuments(data.documents || []);
          setCertificates(data.certificates || []);
          setOriginal(data);
        } else {
          // First-time user → create profile
          setDoc(
            userRef,
            {
              name: auth.currentUser.displayName || "User",
              email: auth.currentUser.email || "",
              phone: "",
              address: "",
              institution: "",
              program: "",
              year: "",
              bio: "",
              avatar: null,
              documents: [],
              certificates: [],
              createdAt: new Date(),
            },
            { merge: true }
          ).catch((err) => {
            console.error("Failed to create profile:", err);
            toast.error("Could not initialize profile.");
          });
        }
      },
      (err) => {
        console.error("Realtime sync error:", err);
        toast.error("Lost connection to profile.");
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const handleChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ----------------------------------------------------------- */
  /* ── Avatar upload (server) -------------------------------- */
  /* ----------------------------------------------------------- */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("avatar", file);

    try {
      const { data } = await api.post("/file/upload-avatar", form);
      setProfile((p) => ({ ...p, avatar: data.url }));
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Avatar upload failed.");
    }
  };

  /* ----------------------------------------------------------- */
  /* ── Document upload (server) ------------------------------ */
  /* ----------------------------------------------------------- */
  const uploadDocument = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Only PDF files allowed.");
      return;
    }

    const form = new FormData();
    form.append("document", file);

    try {
      const { data } = await api.post("/file/upload-document", form);
      setDocuments((prev) => [...prev, data.document]);
      toast.success("Document uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    }
  };

  /* ----------------------------------------------------------- */
  /* ── Delete document (server) ------------------------------ */
  /* ----------------------------------------------------------- */
  const deleteDocument = async (docId) => {
    try {
      await api.post("/file/delete-document", { docId });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.info("Document removed.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  /* ----------------------------------------------------------- */
  /* ── Add Certificate (Firestore) --------------------------- */
  /* ----------------------------------------------------------- */
  const addCertificate = async () => {
    if (!newCert.name || !newCert.issuer || !newCert.date)
      return toast.error("All fields required.");

    const cert = { ...newCert, id: Date.now().toString() };
    const updated = [...certificates, cert];
    setCertificates(updated);
    setNewCert({ name: "", issuer: "", date: "" });

    try {
      await setDoc(doc(db, "users", uid), { certificates: updated }, { merge: true });
      toast.success("Certificate added!");
    } catch (err) {
      toast.error("Failed to add certificate.");
    }
  };

  /* ----------------------------------------------------------- */
  /* ── Delete Certificate (Firestore) ------------------------ */
  /* ----------------------------------------------------------- */
  const deleteCertificate = async (id) => {
    const updated = certificates.filter((c) => c.id !== id);
    setCertificates(updated);
    try {
      await setDoc(doc(db, "users", uid), { certificates: updated }, { merge: true });
      toast.info("Certificate removed.");
    } catch (err) {
      toast.error("Failed to remove certificate.");
    }
  };

  /* ----------------------------------------------------------- */
  /* ── Save Profile (Firestore) ------------------------------ */
  /* ----------------------------------------------------------- */
  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.phone) {
      toast.error("Name, email and phone required.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", uid),
        { ...profile, documents, certificates },
        { merge: true }
      );
      setOriginal({ ...profile });
      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to save profile.");
    }
  };

  const handleCancel = () => {
    setProfile({ ...original });
    setIsEditing(false);
    toast.info("Changes discarded.");
  };

  /* ----------------------------------------------------------- */
  /* ── Render ------------------------------------------------ */
  /* ----------------------------------------------------------- */
  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={profile.name} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
                  >
                    <FaSave /> Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-dashed border-gray-600 overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="w-full h-full p-8 text-gray-500" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaCamera className="text-2xl" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">Click to change</p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon={<FaUser />}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon={<FaEnvelope />}
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon={<FaPhone />}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon={<FaMapMarkerAlt />}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <InputField
                    label="Institution"
                    name="institution"
                    value={profile.institution}
                    onChange={handleChange}
                    disabled={!isEditing}
                    icon={<FaGraduationCap />}
                  />
                  <InputField
                    name="program"
                    placeholder="Program"
                    value={profile.program}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <InputField
                    name="year"
                    placeholder="Year"
                    value={profile.year}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-60 resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FaFilePdf className="text-red-400" /> Documents
              </h2>
              {isEditing && (
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer text-sm">
                  <FaUpload /> Upload PDF
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={uploadDocument}
                  />
                </label>
              )}
            </div>
            <FileList
              items={documents}
              isEditing={isEditing}
              onDelete={deleteDocument}
              IconComponent={FaFilePdf}
            />
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-yellow-400" /> Certificates
            </h2>
            {isEditing && (
              <div className="p-4 bg-gray-800 rounded-lg mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    placeholder="Certificate Name"
                    value={newCert.name}
                    onChange={(e) => setNewCert(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                  />
                  <input
                    placeholder="Issuer"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                  />
                  <input
                    type="date"
                    value={newCert.date}
                    onChange={(e) => setNewCert(p => ({ ...p, date: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={addCertificate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            <FileList
              items={certificates}
              isEditing={isEditing}
              onDelete={deleteCertificate}
            />
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default StudentProfile;