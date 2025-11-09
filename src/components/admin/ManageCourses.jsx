import { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaUniversity, FaBookOpen } from "react-icons/fa";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";
import { toast, ToastContainer } from "react-toastify";

const ManageCourses = () => {
  const [institutions, setInstitutions] = useState([
    {
      id: 1,
      name: "Limkokwing University",
      faculties: [
        {
          id: 1,
          name: "ICT",
          courses: [
            { id: 1, name: "BSc Computer Science", duration: "4 years" },
            { id: 2, name: "Diploma in IT", duration: "2 years" },
          ],
        },
      ],
    },
  ]);

  const [expanded, setExpanded] = useState(null);
  const [showFacultyForm, setShowFacultyForm] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(null);
  const [facultyForm, setFacultyForm] = useState({ name: "" });
  const [courseForm, setCourseForm] = useState({ name: "", duration: "" });

  const addFaculty = (instId) => {
    if (facultyForm.name) {
      setInstitutions(prev =>
        prev.map(inst =>
          inst.id === instId
            ? { ...inst, faculties: [...inst.faculties, { id: Date.now(), name: facultyForm.name, courses: [] }] }
            : inst
        )
      );
      setFacultyForm({ name: "" });
      setShowFacultyForm(null);
      toast.success("Faculty added");
    }
  };

  const addCourse = (instId, facultyId) => {
    if (courseForm.name && courseForm.duration) {
      setInstitutions(prev =>
        prev.map(inst =>
          inst.id === instId
            ? {
                ...inst,
                faculties: inst.faculties.map(f =>
                  f.id === facultyId
                    ? { ...f, courses: [...f.courses, { id: Date.now(), ...courseForm }] }
                    : f
                ),
              }
            : inst
        )
      );
      setCourseForm({ name: "", duration: "" });
      setShowCourseForm(null);
      toast.success("Course added");
    }
  };

  const deleteFaculty = (instId, facultyId) => {
    setInstitutions(prev =>
      prev.map(inst =>
        inst.id === instId
          ? { ...inst, faculties: inst.faculties.filter(f => f.id !== facultyId) }
          : inst
      )
    );
    toast.info("Faculty removed");
  };

  const deleteCourse = (instId, facultyId, courseId) => {
    setInstitutions(prev =>
      prev.map(inst =>
        inst.id === instId
          ? {
              ...inst,
              faculties: inst.faculties.map(f =>
                f.id === facultyId
                  ? { ...f, courses: f.courses.filter(c => c.id !== courseId) }
                  : f
              ),
            }
          : inst
      )
    );
    toast.info("Course removed");
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav adminName="System Admin" />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <FaBookOpen /> Faculties & Courses
          </h1>

          <div className="space-y-6">
            {institutions.map(inst => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-5"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpanded(expanded === inst.id ? null : inst.id)}
                >
                  <div className="flex items-center gap-3">
                    <FaUniversity className="text-purple-400" />
                    <h3 className="font-semibold text-lg">{inst.name}</h3>
                  </div>
                  <span className="text-sm text-gray-400">
                    {inst.faculties.length} {inst.faculties.length === 1 ? "Faculty" : "Faculties"}
                  </span>
                </div>

                {expanded === inst.id && (
                  <div className="mt-5 space-y-4">
                    {inst.faculties.map(faculty => (
                      <div key={faculty.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <FaBookOpen className="text-blue-400" /> {faculty.name}
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowCourseForm({ instId: inst.id, facultyId: faculty.id })}
                              className="text-green-400 text-sm"
                            >
                              <FaPlus />
                            </button>
                            <button onClick={() => deleteFaculty(inst.id, faculty.id)} className="text-red-400">
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        {showCourseForm?.instId === inst.id && showCourseForm?.facultyId === faculty.id && (
                          <div className="mb-4 p-3 bg-gray-700 rounded-lg space-y-2">
                            <input
                              placeholder="Course Name"
                              value={courseForm.name}
                              onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-600 rounded"
                            />
                            <input
                              placeholder="Duration"
                              value={courseForm.duration}
                              onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-600 rounded"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => addCourse(inst.id, faculty.id)}
                                className="px-3 py-1 bg-green-600 rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setShowCourseForm(null)}
                                className="px-3 py-1 bg-gray-600 rounded text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {faculty.courses.map(course => (
                            <div
                              key={course.id}
                              className="flex justify-between items-center p-2 bg-gray-700 rounded"
                            >
                              <span className="text-sm">{course.name} • {course.duration}</span>
                              <button
                                onClick={() => deleteCourse(inst.id, faculty.id, course.id)}
                                className="text-red-400"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add Faculty Button */}
                    <button
                      onClick={() => setShowFacultyForm(inst.id)}
                      className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 flex items-center justify-center gap-2"
                    >
                      <FaPlus /> Add Faculty
                    </button>

                    {showFacultyForm === inst.id && (
                      <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                        <input
                          placeholder="Faculty Name"
                          value={facultyForm.name}
                          onChange={e => setFacultyForm({ name: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 rounded mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => addFaculty(inst.id)}
                            className="px-3 py-1 bg-green-600 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowFacultyForm(null)}
                            className="px-3 py-1 bg-gray-600 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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