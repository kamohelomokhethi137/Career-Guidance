import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaBook } from "react-icons/fa";
import InstituteSidebar from "../../components/institute/Sidebar";
import InstituteTopNav from "../../components/institute/TopNav";
import { toast, ToastContainer } from "react-toastify";

const ManageCourses = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: "BSc Computer Science", faculty: "ICT", duration: "4 years", intake: "Feb, Aug" },
    { id: 2, name: "Diploma in IT", faculty: "ICT", duration: "2 years", intake: "Feb" },
    { id: 3, name: "BCom Accounting", faculty: "Business", duration: "4 years", intake: "Aug" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", faculty: "", duration: "", intake: "" });

  const handleAdd = () => {
    if (form.name && form.faculty && form.duration) {
      setCourses(prev => [...prev, { id: Date.now(), ...form }]);
      setForm({ name: "", faculty: "", duration: "", intake: "" });
      setShowForm(false);
      toast.success("Course added!");
    } else {
      toast.error("Name, faculty, and duration required.");
    }
  };

  const handleDelete = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    toast.info("Course removed");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <InstituteSidebar />
      <div className="flex-1 md:ml-64">
        <InstituteTopNav instituteName="Limkokwing" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FaBook /> Manage Courses
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Course
            </button>
          </div>

          {/* Add Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Course Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-2 bg-gray-800 rounded-lg"
                />
                <input
                  placeholder="Faculty"
                  value={form.faculty}
                  onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="px-3 py-2 bg-gray-800 rounded-lg"
                />
                <input
                  placeholder="Duration (e.g. 4 years)"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="px-3 py-2 bg-gray-800 rounded-lg"
                />
                <input
                  placeholder="Intake (e.g. Feb, Aug)"
                  value={form.intake}
                  onChange={e => setForm({ ...form, intake: e.target.value })}
                  className="px-3 py-2 bg-gray-800 rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAdd} className="px-4 py-2 bg-green-600 rounded-lg">Save</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 rounded-lg">Cancel</button>
              </div>
            </motion.div>
          )}

          {/* Course List */}
          <div className="grid gap-4">
            {courses.map(course => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-lg">{course.name}</h3>
                  <p className="text-sm text-gray-400">
                    {course.faculty} • {course.duration} • Intake: {course.intake}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-400 hover:text-blue-300">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="text-red-400 hover:text-red-300">
                    <FaTrash />
                  </button>
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