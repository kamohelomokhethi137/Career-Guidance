import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaGraduationCap, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

export default function CourseApplications() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [studentName, setStudentName] = useState('Student');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [institutionCount, setInstitutionCount] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // ── Load user from localStorage and react to changes ─────────────────────────
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser) {
        setUser(storedUser);
        setStudentName(storedUser.fullName || storedUser.name || 'Student');
        setUid(localStorage.getItem('uid'));
      } else {
        setUser(null);
        setStudentName('Student');
        setUid(null);
      }
    };

    loadUser();

    // Listen for login/logout events in the same tab
    window.addEventListener('userUpdated', loadUser);

    // Listen for localStorage changes in other tabs
    const storageHandler = (e) => {
      if (e.key === 'user') loadUser();
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('userUpdated', loadUser);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  // ── Load courses ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'courses'), snap =>
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  // ── Load student applications ───────────────────────────
  useEffect(() => {
    if (!uid) return;

    const appsQuery = query(collection(db, 'applications'), where('studentId', '==', uid));
    const unsub = onSnapshot(appsQuery, snap => {
      const userApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setApplications(userApps);

      // Count per institution
      const count = {};
      userApps.forEach(app => {
        if (app.institute) count[app.institute] = (count[app.institute] || 0) + 1;
      });
      setInstitutionCount(count);

      // Show notifications for status changes
      userApps.forEach(app => {
        if (app.status === 'approved') {
          toast.success(`🎉 Congratulations! Your application for ${courses.find(c => c.id === app.courseId)?.name || 'a course'} has been approved!`);
        } else if (app.status === 'rejected') {
          toast.error(`❌ Your application for ${courses.find(c => c.id === app.courseId)?.name || 'a course'} has been rejected.`);
        }
      });
    });

    return () => unsub();
  }, [uid, courses]);

  // ── Filter courses ───────────────────────────────────────
  const filteredCourses = courses.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Direct Apply ────────────────────────────────────────
  const handleApply = async (course) => {
    if (!uid) return toast.error('User not logged in');
    if (!course?.instituteId) return toast.error('Course data incomplete');

    const appsAtInstitution = institutionCount[course.instituteId] || 0;
    if (appsAtInstitution >= 2) return toast.error(`Max 2 courses per institution. You have ${appsAtInstitution}`);
    if (applications.some(a => a.courseId === course.id)) return toast.warning('Already applied');

    setLoadingId(course.id);

    try {
      await addDoc(collection(db, 'applications'), {
        studentId: uid,
        courseId: course.id,
        institute: course.instituteId,
        status: 'pending',
        appliedAt: serverTimestamp(),
      });

      toast.success(`Applied to ${course.name}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply. Try again.');
    } finally {
      setLoadingId(null);
    }
  };

  // ── Get application status text and style ─────────────────
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { 
          text: 'Approved ✅', 
          class: 'bg-green-900 text-green-400',
          badgeClass: 'bg-green-900 text-green-400 border border-green-700'
        };
      case 'rejected':
        return { 
          text: 'Rejected ❌', 
          class: 'bg-red-900 text-red-400',
          badgeClass: 'bg-red-900 text-red-400 border border-red-700'
        };
      case 'pending':
        return { 
          text: 'Pending ⏳', 
          class: 'bg-yellow-900 text-yellow-400',
          badgeClass: 'bg-yellow-900 text-yellow-400 border border-yellow-700'
        };
      default:
        return { 
          text: 'Applied', 
          class: 'bg-gray-800 text-gray-400',
          badgeClass: 'bg-gray-800 text-gray-400 border border-gray-700'
        };
    }
  };

  // ── Render ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-16 rounded-3xl">
          <h1 className="text-5xl font-bold mb-6">User Not Logged In</h1>
          <p className="text-2xl mb-8">Please log in to apply for courses</p>
          <a href="/login" className="bg-white text-black px-12 py-5 rounded-xl text-2xl font-bold">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={studentName} />
        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-6">

          {/* Header */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Course Applications</h1>
            <p className="text-white/70">
              Browse courses and apply to up to 2 programs per institution.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <FaCheck />
                <span>{applications.length} Applications Submitted</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <FaExclamationTriangle />
                <span>Max 2 courses per institution</span>
              </div>
              {applications.some(app => app.status === 'approved') && (
                <div className="flex items-center space-x-2 text-green-400">
                  <FaCheck />
                  <span>You have approved applications! 🎉</span>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 relative">
            <FaSearch className="absolute left-11 top-10 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses or faculties..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const application = applications.find(a => a.courseId === course.id);
              const applied = !!application;
              const status = application?.status;
              const statusInfo = getStatusInfo(status);
              const canApply = (institutionCount[course.instituteId] || 0) < 2;
              const isLoading = loadingId === course.id;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-900 rounded-2xl border p-6 transition-colors ${
                    status === 'approved' 
                      ? 'border-green-800 hover:border-green-600' 
                      : status === 'rejected'
                      ? 'border-red-800 hover:border-red-600'
                      : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <FaGraduationCap className="text-2xl text-blue-400" />
                    {status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badgeClass}`}>
                        {statusInfo.text}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">{course.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">Faculty: {course.faculty}</p>
                  <p className="text-gray-300 text-sm mb-2">Duration: {course.duration}</p>
                  <p className="text-gray-300 text-sm mb-4">Intake: {course.intake}</p>

                  <button
                    onClick={() => handleApply(course)}
                    disabled={applied || !canApply || isLoading}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      applied
                        ? statusInfo.class
                        : !canApply
                        ? 'bg-red-900 text-red-400 cursor-not-allowed'
                        : isLoading
                        ? 'bg-blue-700 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading
                      ? 'Applying...'
                      : applied
                      ? statusInfo.text
                      : !canApply
                      ? 'Limit Reached'
                      : 'Apply Now'}
                  </button>

                  {/* Status message for approved/rejected */}
                  {status === 'approved' && (
                    <p className="text-green-400 text-xs mt-2 text-center">
                      Congratulations! Your application has been approved.
                    </p>
                  )}
                  {status === 'rejected' && (
                    <p className="text-red-400 text-xs mt-2 text-center">
                      Your application has been rejected.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

        </main>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}