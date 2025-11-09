import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaTimesCircle, FaFileDownload } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

const admissionResults = [
  {
    id: 1,
    course: 'BSc Computer Science',
    institution: 'Limkokwing University',
    appliedDate: '2024-01-15',
    status: 'accepted',
    decisionDate: '2024-02-01',
    admissionLetter: 'admission_letter_1.pdf',
    requirements: ['Submit original certificates', 'Pay acceptance fee', 'Complete registration'],
    deadline: '2024-02-15'
  },
  {
    id: 2,
    course: 'Diploma in Information Technology',
    institution: 'Lesotho College',
    appliedDate: '2024-01-20',
    status: 'under_review',
    decisionDate: null,
    admissionLetter: null,
    requirements: [],
    deadline: null
  },
  {
    id: 3,
    course: 'BSc Business Information Technology',
    institution: 'National University of Lesotho',
    appliedDate: '2024-01-25',
    status: 'rejected',
    decisionDate: '2024-02-05',
    admissionLetter: null,
    requirements: [],
    deadline: null
  }
];

const statusConfig = {
  pending: { color: 'bg-yellow-900 text-yellow-400', icon: FaClock, label: 'Pending' },
  under_review: { color: 'bg-blue-900 text-blue-400', icon: FaClock, label: 'Under Review' },
  accepted: { color: 'bg-green-900 text-green-400', icon: FaCheckCircle, label: 'Accepted' },
  rejected: { color: 'bg-red-900 text-red-400', icon: FaTimesCircle, label: 'Rejected' }
};

export default function AdmissionsResults() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentName = user.name;

  const handleAcceptOffer = (application) => {
    toast.success(`Offer accepted for ${application.course}! We'll contact you with next steps.`);
  };

  const handleDownloadLetter = (application) => {
    toast.info('Downloading admission letter...');
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />

      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={studentName} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              Admissions Results
            </h1>
            <p className="text-white/70">
              Track the status of your course applications and view admission decisions.
            </p>
          </div>

          <div className="space-y-4">
            {admissionResults.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{application.course}</h3>
                        <p className="text-blue-400">{application.institution}</p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 text-white/80">
                      <div>
                        <span className="text-white/50">Applied:</span>{' '}
                        <span>{new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      {application.decisionDate && (
                        <div>
                          <span className="text-white/50">Decision:</span>{' '}
                          <span>{new Date(application.decisionDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {application.status === 'accepted' && application.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Next Steps:</h4>
                        <ul className="space-y-1 text-white/70">
                          {application.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <span className="text-green-400 mr-2">•</span>
                              {req} {application.deadline && idx === 0 && `(Deadline: ${new Date(application.deadline).toLocaleDateString()})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {application.admissionLetter && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <FaFileDownload className="text-white/70" />
                        <span className="text-sm">Admission Letter: </span>
                        <button
                          onClick={() => handleDownloadLetter(application)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {application.admissionLetter}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 mt-4 lg:mt-0 lg:ml-6">
                    {application.status === 'accepted' && (
                      <button 
                        onClick={() => handleAcceptOffer(application)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        Accept Offer
                      </button>
                    )}
                    <button className="border border-gray-600 text-white/80 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="text-sm" />
      <span>{config.label}</span>
    </span>
  );
}
