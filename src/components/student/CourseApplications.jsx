import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaGraduationCap, FaMapMarkerAlt, FaClock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

const mockCourses = [
  {
    id: 1,
    title: 'BSc Computer Science',
    institution: 'Limkokwing University',
    location: 'Maseru',
    duration: '4 years',
    requirements: 'Math & Science with minimum B grade',
    deadline: '2024-03-15',
    applied: false,
    qualification: 'High School Diploma'
  },
  {
    id: 2,
    title: 'Diploma in Information Technology',
    institution: 'Lesotho College',
    location: 'Maseru',
    duration: '2 years',
    requirements: 'Math with minimum C grade',
    deadline: '2024-03-20',
    applied: false,
    qualification: 'High School Diploma'
  },
  {
    id: 3,
    title: 'BSc Business Information Technology',
    institution: 'National University of Lesotho',
    location: 'Roma',
    duration: '4 years',
    requirements: 'Math & English with minimum B grade',
    deadline: '2024-03-25',
    applied: false,
    qualification: 'High School Diploma'
  }
];

export default function CourseApplications() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentName = user.name || 'User';

  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [institutionApplications, setInstitutionApplications] = useState({});

  // Track applications per institution
  useEffect(() => {
    const institutionCount = {};
    applications.forEach(app => {
      institutionCount[app.institution] = (institutionCount[app.institution] || 0) + 1;
    });
    setInstitutionApplications(institutionCount);
  }, [applications]);

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApply = (course) => {
    const currentApplications = institutionApplications[course.institution] || 0;

    if (currentApplications >= 2) {
      toast.error(`You can only apply to max 2 courses per institution. Already applied: ${currentApplications}`);
      return;
    }

    const alreadyApplied = applications.find(app => 
      app.courseId === course.id && app.institution === course.institution
    );

    if (alreadyApplied) {
      toast.warning('You have already applied to this course.');
      return;
    }

    setSelectedCourse(course);
    setShowApplicationForm(true);
  };

  const submitApplication = (applicationData) => {
    const newApplication = {
      id: Date.now(),
      courseId: selectedCourse.id,
      title: selectedCourse.title,
      institution: selectedCourse.institution,
      appliedDate: new Date().toISOString(),
      status: 'pending',
      ...applicationData
    };

    setApplications([...applications, newApplication]);

    const updatedCourses = mockCourses.map(course =>
      course.id === selectedCourse.id ? { ...course, applied: true } : course
    );

    setShowApplicationForm(false);
    setSelectedCourse(null);
    toast.success(`Application submitted for ${selectedCourse.title} at ${selectedCourse.institution}!`);
  };

  const getApplicationStatus = (course) => {
    const application = applications.find(app => app.courseId === course.id);
    return application ? application.status : null;
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />

      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={studentName} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Course Applications</h1>
            <p className="text-white/70">
              Browse available courses and apply to up to 2 programs per institution.
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <FaCheck />
                <span>{applications.length} Applications Submitted</span>
              </div>
              <div className="flex items-center space-x-2 text-yellow-400">
                <FaExclamationTriangle />
                <span>Max 2 courses per institution</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or institutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const applicationStatus = getApplicationStatus(course);
              const applicationsAtInstitution = institutionApplications[course.institution] || 0;
              const canApply = applicationsAtInstitution < 2;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FaGraduationCap className="text-2xl text-blue-400" />
                    {applicationStatus && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        applicationStatus === 'accepted' ? 'bg-green-900 text-green-400' :
                        applicationStatus === 'rejected' ? 'bg-red-900 text-red-400' :
                        'bg-yellow-900 text-yellow-400'
                      }`}>
                        {applicationStatus}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                  <p className="text-blue-400 font-medium mb-3">{course.institution}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <FaMapMarkerAlt className="mr-2" />
                      {course.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <FaClock className="mr-2" />
                      {course.duration}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">
                    <strong className="text-white">Requirements:</strong> {course.requirements}
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Application deadline: {new Date(course.deadline).toLocaleDateString()}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {applicationsAtInstitution}/2 applications at this institution
                    </span>
                    <button
                      onClick={() => handleApply(course)}
                      disabled={!canApply || applicationStatus}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        applicationStatus
                          ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                          : !canApply
                          ? 'bg-red-900 text-red-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {applicationStatus ? 'Applied' : !canApply ? 'Limit Reached' : 'Apply Now'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {showApplicationForm && (
            <ApplicationForm
              course={selectedCourse}
              onSubmit={submitApplication}
              onCancel={() => setShowApplicationForm(false)}
            />
          )}
        </main>

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}

function ApplicationForm({ course, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    personalStatement: '',
    supportingDocuments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.personalStatement.trim()) {
      toast.error('Please provide a personal statement');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Apply to {course.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personal Statement
            </label>
            <textarea
              required
              rows={4}
              value={formData.personalStatement}
              onChange={(e) => setFormData({...formData, personalStatement: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why you're interested in this course and why you're a good fit..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
