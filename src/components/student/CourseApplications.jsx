import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUniversity, FaCheck, FaExclamationTriangle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

export default function UniversityApplications() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [studentName, setStudentName] = useState('Student');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [institutionCount, setInstitutionCount] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, undergraduate, postgraduate, diploma

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

  // ── Load available university applications ─────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'universityApplications'), where('status', '==', 'active')),
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setApplications(apps);
      }
    );
    return () => unsub();
  }, []);

  // ── Load student's submitted applications ───────────────────────────────────
  useEffect(() => {
    if (!uid) return;

    const appsQuery = query(collection(db, 'studentApplications'), where('studentId', '==', uid));
    const unsub = onSnapshot(appsQuery, snap => {
      const userApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyApplications(userApps);

      // Count per institution
      const count = {};
      userApps.forEach(app => {
        if (app.instituteId) count[app.instituteId] = (count[app.instituteId] || 0) + 1;
      });
      setInstitutionCount(count);

      // Show notifications for status changes
      userApps.forEach(app => {
        if (app.status === 'approved') {
          toast.success(`🎉 Congratulations! Your application to ${app.instituteName} has been approved!`);
        } else if (app.status === 'rejected') {
          toast.error(` Your application to ${app.instituteName} has been rejected.`);
        }
      });
    });

    return () => unsub();
  }, [uid]);

  // ── Filter applications ────────────────────────────────────────────────────
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.instituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.academicLevel?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      app.programType === filter;

    const isNotExpired = !app.deadline || new Date(app.deadline) > new Date();

    return matchesSearch && matchesFilter && isNotExpired;
  });

  // ── Apply to University ────────────────────────────────────────────────────
  const handleApply = async (application) => {
    if (!uid) return toast.error('Please log in to apply');
    if (!application?.instituteId) return toast.error('Application data incomplete');

    const appsAtInstitution = institutionCount[application.instituteId] || 0;
    if (appsAtInstitution >= 2) {
      return toast.error(`Maximum 2 applications per institution. You have ${appsAtInstitution}`);
    }

    const alreadyApplied = myApplications.some(a => a.applicationId === application.id);
    if (alreadyApplied) return toast.warning('You have already applied to this program');

    setLoadingId(application.id);

    try {
      await addDoc(collection(db, 'studentApplications'), {
        studentId: uid,
        studentName: studentName,
        applicationId: application.id,
        instituteId: application.instituteId,
        instituteName: application.instituteName,
        programTitle: application.title,
        programType: application.programType,
        academicLevel: application.academicLevel,
        status: 'pending',
        appliedAt: serverTimestamp(),
      });

      toast.success(`Application submitted to ${application.instituteName}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  // ── Get application status text and style ──────────────────────────────────
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { 
          text: 'Approved ', 
          class: 'bg-green-900 text-green-400',
          badgeClass: 'bg-green-900 text-green-400 border border-green-700'
        };
      case 'rejected':
        return { 
          text: 'Rejected ', 
          class: 'bg-red-900 text-red-400',
          badgeClass: 'bg-red-900 text-red-400 border border-red-700'
        };
      case 'pending':
        return { 
          text: 'Pending Review ', 
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

  // ── Format date ────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // ── Check if deadline is approaching ───────────────────────────────────────
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  };

  // ── Check if deadline passed ───────────────────────────────────────────────
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-16 rounded-3xl">
          <h1 className="text-5xl font-bold mb-6">User Not Logged In</h1>
          <p className="text-2xl mb-8">Please log in to browse university applications</p>
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">University Applications</h1>
            <p className="text-white/70">
              Browse available programs from various institutions and apply to up to 2 programs per university.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <FaCheck />
                <span>{myApplications.length} Applications Submitted</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <FaExclamationTriangle />
                <span>Max 2 applications per institution</span>
              </div>
              {myApplications.some(app => app.status === 'approved') && (
                <div className="flex items-center space-x-2 text-green-400">
                  <FaCheck />
                  <span>You have approved applications!</span>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs, universities, or fields of study..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setFilter('undergraduate')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'undergraduate' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Undergraduate
              </button>
              <button
                onClick={() => setFilter('postgraduate')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'postgraduate' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Postgraduate
              </button>
              <button
                onClick={() => setFilter('diploma')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'diploma' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Diploma
              </button>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredApplications.map(app => {
              const myApplication = myApplications.find(a => a.applicationId === app.id);
              const applied = !!myApplication;
              const status = myApplication?.status;
              const statusInfo = getStatusInfo(status);
              const canApply = (institutionCount[app.instituteId] || 0) < 2;
              const isLoading = loadingId === app.id;
              const deadlineApproaching = isDeadlineApproaching(app.deadline);
              const deadlinePassed = isDeadlinePassed(app.deadline);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-900 rounded-2xl border p-6 transition-colors ${
                    status === 'approved' 
                      ? 'border-green-800 hover:border-green-600' 
                      : status === 'rejected'
                      ? 'border-red-800 hover:border-red-600'
                      : deadlinePassed
                      ? 'border-red-800 opacity-70'
                      : deadlineApproaching
                      ? 'border-orange-600 hover:border-orange-500'
                      : 'border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <FaUniversity className="text-2xl text-blue-400" />
                    <div className="flex flex-col items-end gap-2">
                      {status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badgeClass}`}>
                          {statusInfo.text}
                        </span>
                      )}
                      {deadlineApproaching && !applied && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-400 border border-orange-700">
                          Deadline Soon!
                        </span>
                      )}
                      {deadlinePassed && !applied && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-400 border border-red-700">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{app.title}</h3>
                  <p className="text-blue-400 font-medium mb-3">{app.instituteName}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="capitalize bg-gray-800 px-2 py-1 rounded">
                        {app.programType || 'Program'}
                      </span>
                      <span className="bg-gray-800 px-2 py-1 rounded">
                        {app.academicLevel}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">{app.description}</p>
                    
                    {app.requirements && (
                      <p className="text-gray-400 text-xs">
                        <strong>Requirements:</strong> {app.requirements}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt />
                      <span>Due: {formatDate(app.deadline)}</span>
                    </div>
                    {deadlineApproaching && !deadlinePassed && (
                      <div className="flex items-center gap-1 text-orange-400">
                        <FaClock />
                        <span>Hurry!</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleApply(app)}
                    disabled={applied || !canApply || isLoading || deadlinePassed}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                      applied
                        ? statusInfo.class
                        : deadlinePassed
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : !canApply
                        ? 'bg-red-900 text-red-400 cursor-not-allowed'
                        : isLoading
                        ? 'bg-blue-700 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading
                      ? 'Submitting...'
                      : applied
                      ? statusInfo.text
                      : deadlinePassed
                      ? 'Application Closed'
                      : !canApply
                      ? 'Institution Limit Reached'
                      : 'Apply Now'}
                  </button>

                  {/* Status message for approved/rejected */}
                  {status === 'approved' && (
                    <p className="text-green-400 text-xs mt-2 text-center">
                      Congratulations! Your application has been approved by {app.instituteName}.
                    </p>
                  )}
                  {status === 'rejected' && (
                    <p className="text-red-400 text-xs mt-2 text-center">
                      Your application has been reviewed and rejected.
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
              <FaUniversity className="text-6xl mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchTerm ? 'No matching programs found' : 'No applications available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Check back later for new program openings'
                }
              </p>
            </div>
          )}

        </main>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}