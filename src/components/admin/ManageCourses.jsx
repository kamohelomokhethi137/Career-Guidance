import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaUniversity, FaBookOpen, FaSpinner } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import AdminSidebar from "../../components/admin/Sidebar";
import AdminTopNav from "../../components/admin/TopNav";

const ManageCourses = () => {
  const [institutions, setInstitutions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [showFacultyForm, setShowFacultyForm] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(null);
  const [facultyForm, setFacultyForm] = useState({ name: "" });
  const [courseForm, setCourseForm] = useState({ name: "", duration: "", intake: "" });
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Load admin name
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminName(user.fullName || user.name || "Admin");

    // Load institutions from Firestore
    const unsubscribe = onSnapshot(collection(db, "institutes"), (snapshot) => {
      const instData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        faculties: doc.data().faculties || []
      }));
      setInstitutions(instData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addFaculty = async (instId) => {
    if (!facultyForm.name) return toast.error("Faculty name required");

    try {
      const institution = institutions.find(inst => inst.id === instId);
      const updatedFaculties = [...(institution.faculties || []), { 
        id: Date.now().toString(), 
        name: facultyForm.name, 
        courses: [] 
      }];

      await updateDoc(doc(db, "institutes", instId), {
        faculties: updatedFaculties
      });

      setFacultyForm({ name: "" });
      setShowFacultyForm(null);
      toast.success("Faculty added successfully");
    } catch (error) {
      console.error("Error adding faculty:", error);
      toast.error("Failed to add faculty");
    }
  };

  const addCourse = async (instId, facultyId) => {
    if (!courseForm.name || !courseForm.duration) {
      return toast.error("Course name and duration required");
    }

    try {
      const institution = institutions.find(inst => inst.id === instId);
      const faculty = institution.faculties.find(f => f.id === facultyId);
      
      const updatedFaculties = institution.faculties.map(f => 
        f.id === facultyId 
          ? { 
              ...f, 
              courses: [...(f.courses || []), { 
                id: Date.now().toString(), 
                name: courseForm.name, 
                duration: courseForm.duration,
                intake: courseForm.intake || "Not specified"
              }] 
            } 
          : f
      );

      await updateDoc(doc(db, "institutes", instId), {
        faculties: updatedFaculties
      });

      setCourseForm({ name: "", duration: "", intake: "" });
      setShowCourseForm(null);
      toast.success("Course added successfully");
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    }
  };

  const deleteFaculty = async (instId, facultyId) => {
    try {
      const institution = institutions.find(inst => inst.id === instId);
      const updatedFaculties = institution.faculties.filter(f => f.id !== facultyId);

      await updateDoc(doc(db, "institutes", instId), {
        faculties: updatedFaculties
      });

      toast.info("Faculty removed");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast.error("Failed to remove faculty");
    }
  };

  const deleteCourse = async (instId, facultyId, courseId) => {
    try {
      const institution = institutions.find(inst => inst.id === instId);
      const updatedFaculties = institution.faculties.map(f => 
        f.id === facultyId 
          ? { ...f, courses: (f.courses || []).filter(c => c.id !== courseId) } 
          : f
      );

      await updateDoc(doc(db, "institutes", instId), {
        faculties: updatedFaculties
      });

      toast.info("Course removed");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to remove course");
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex">
        <AdminSidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64">
        <AdminTopNav />

        <main className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <FaBookOpen /> Faculties & Courses
          </h1>

          <div className="space-y-6">
            {institutions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaUniversity className="mx-auto text-4xl mb-3" />
                <p>No institutions found</p>
              </div>
            ) : (
              institutions.map(inst => (
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
                      <h3 className="font-semibold text-lg">{inst.institutionName}</h3>
                    </div>
                    <span className="text-sm text-gray-400">
                      {(inst.faculties || []).length} {(inst.faculties || []).length === 1 ? "Faculty" : "Faculties"}
                    </span>
                  </div>

                  {expanded === inst.id && (
                    <div className="mt-5 space-y-4">
                      {(inst.faculties || []).map(faculty => (
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
                              <button 
                                onClick={() => deleteFaculty(inst.id, faculty.id)} 
                                className="text-red-400"
                              >
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
                                placeholder="Duration (e.g., 4 years)"
                                value={courseForm.duration}
                                onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-600 rounded"
                              />
                              <input
                                placeholder="Intake (e.g., January 2024)"
                                value={courseForm.intake}
                                onChange={e => setCourseForm({ ...courseForm, intake: e.target.value })}
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
                            {(faculty.courses || []).map(course => (
                              <div
                                key={course.id}
                                className="flex justify-between items-center p-2 bg-gray-700 rounded"
                              >
                                <div>
                                  <span className="text-sm block">{course.name}</span>
                                  <span className="text-xs text-gray-400">
                                    {course.duration} • {course.intake}
                                  </span>
                                </div>
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
              ))
            )}
          </div>
        </main>

        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </div>
  );
};

export default ManageCourses;