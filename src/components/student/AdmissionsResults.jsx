import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaTimesCircle, FaFileDownload, FaSpinner, FaUniversity } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

const statusConfig = {
  pending: { color: 'bg-yellow-900 text-yellow-400', icon: FaClock, label: 'Pending' },
  under_review: { color: 'bg-blue-900 text-blue-400', icon: FaClock, label: 'Under Review' },
  approved: { color: 'bg-green-900 text-green-400', icon: FaCheckCircle, label: 'Approved' },
  admitted: { color: 'bg-green-900 text-green-400', icon: FaCheckCircle, label: 'Admitted' },
  rejected: { color: 'bg-red-900 text-red-400', icon: FaTimesCircle, label: 'Rejected' }
};

export default function AdmissionsResults() {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user
  useEffect(() => {
    const loadUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (storedUser) {
        setUser(storedUser);
        setUid(localStorage.getItem('uid'));
      }
    };

    loadUser();
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  // Load real-time applications data from studentApplications collection
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const appsQuery = query(
      collection(db, 'studentApplications'),
      where('studentId', '==', uid)
    );

    const unsubscribe = onSnapshot(appsQuery, async (snapshot) => {
      try {
        const appsData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const appData = docSnap.data();
            
            // Fetch university application details for more context
            let programTitle = appData.programTitle || 'Unknown Program';
            let programDescription = '';
            let requirements = '';

            try {
              if (appData.applicationId) {
                const universityAppDoc = await getDoc(doc(db, 'universityApplications', appData.applicationId));
                if (universityAppDoc.exists()) {
                  const universityApp = universityAppDoc.data();
                  programTitle = universityApp.title || programTitle;
                  programDescription = universityApp.description || '';
                  requirements = universityApp.requirements || '';
                }
              }
            } catch (error) {
              console.error('Error fetching university application:', error);
            }

            return {
              id: docSnap.id,
              applicationId: appData.applicationId,
              program: programTitle,
              programDescription: programDescription,
              institution: appData.instituteName || 'Unknown Institution',
              programType: appData.programType || '',
              academicLevel: appData.academicLevel || '',
              status: appData.status || 'pending',
              appliedDate: appData.appliedAt?.toDate?.() || new Date(),
              decisionDate: appData.updatedAt?.toDate?.() || null,
              admissionLetter: appData.admissionLetter || null,
              requirements: requirements,
              studentResponse: appData.studentResponse || null
            };
          })
        );

        setApplications(appsData);
      } catch (error) {
        console.error('Error processing applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Firestore error:', error);
      toast.error('Failed to load applications');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleAcceptOffer = async (application) => {
    if (!uid) return toast.error('User not logged in');

    try {
      await updateDoc(doc(db, 'studentApplications', application.id), {
        studentResponse: 'accepted',
        respondedAt: new Date(),
        status: 'admitted'
      });
      toast.success('Congratulations. You have accepted the offer for ' + application.program);
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer. Please try again.');
    }
  };

  const handleDeclineOffer = async (application) => {
    if (!uid) return toast.error('User not logged in');

    try {
      await updateDoc(doc(db, 'studentApplications', application.id), {
        studentResponse: 'declined',
        respondedAt: new Date()
      });
      toast.info('Offer declined for ' + application.program);
    } catch (error) {
      console.error('Error declining offer:', error);
      toast.error('Failed to decline offer. Please try again.');
    }
  };

  const handleDownloadLetter = (application) => {
    if (application.admissionLetter) {
      window.open(application.admissionLetter, '_blank');
      toast.info('Downloading admission letter');
    } else {
      toast.warning('Admission letter not available yet');
    }
  };

  // Check if student is admitted to any program
  const isAdmitted = applications.some(app => app.status === 'admitted');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const admittedApplications = applications.filter(app => app.status === 'admitted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center bg-gray-900 p-8 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <a href="/login" className="bg-white text-black px-6 py-3 rounded-lg font-bold">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />

      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={user.fullName || user.name || 'Student'} />

        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-6">
          {/* Header with admission status */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                  Admissions Results
                </h1>
                <p className="text-white/70">
                  Track the status of your university applications and view admission decisions.
                </p>
              </div>
              
              {isAdmitted && (
                <div className="mt-4 md:mt-0">
                  <div className="bg-green-900 border border-green-700 rounded-lg px-4 py-2">
                    <p className="text-green-400 font-semibold">You have been admitted</p>
                    <p className="text-green-300 text-sm">Congratulations on your acceptance</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="text-white/50">
                {applications.length} application{applications.length !== 1 ? 's' : ''} total
              </div>
              {approvedApplications.length > 0 && (
                <div className="text-green-400">
                  {approvedApplications.length} approved
                </div>
              )}
              {admittedApplications.length > 0 && (
                <div className="text-green-400">
                  {admittedApplications.length} admitted
                </div>
              )}
              {rejectedApplications.length > 0 && (
                <div className="text-red-400">
                  {rejectedApplications.length} rejected
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-400" />
              <span className="ml-3">Loading applications...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
              <FaUniversity className="text-6xl mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
              <p className="text-white/70">You have not applied to any university programs yet.</p>
              <a href="/student/university-applications" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Browse University Programs
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-900 rounded-2xl border p-6 ${
                    application.status === 'admitted' 
                      ? 'border-green-700 bg-green-900/20' 
                      : application.status === 'approved'
                      ? 'border-blue-700'
                      : application.status === 'rejected'
                      ? 'border-red-700 bg-red-900/20'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{application.program}</h3>
                          <p className="text-blue-400">{application.institution}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {application.programType && (
                              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded capitalize">
                                {application.programType}
                              </span>
                            )}
                            {application.academicLevel && (
                              <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                {application.academicLevel}
                              </span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 text-white/80">
                        <div>
                          <span className="text-white/50">Applied:</span>{' '}
                          <span>{application.appliedDate.toLocaleDateString()}</span>
                        </div>
                        {application.decisionDate && (
                          <div>
                            <span className="text-white/50">Updated:</span>{' '}
                            <span>{application.decisionDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Show different content based on status */}
                      {application.status === 'approved' && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">You have been approved</h4>
                          <p className="text-white/70 text-sm mb-2">
                            Congratulations. Your application has been approved. Please respond to this offer.
                          </p>
                          {application.requirements && (
                            <>
                              <h4 className="text-sm font-medium text-white mb-2">Requirements:</h4>
                              <p className="text-white/70 text-sm">{application.requirements}</p>
                            </>
                          )}
                        </div>
                      )}

                      {application.status === 'admitted' && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">You are Admitted</h4>
                          <p className="text-green-400 text-sm mb-2">
                            Welcome. You have accepted the offer and are now admitted to this program.
                          </p>
                          {application.requirements && (
                            <>
                              <h4 className="text-sm font-medium text-white mb-2">Requirements:</h4>
                              <p className="text-white/70 text-sm">{application.requirements}</p>
                            </>
                          )}
                        </div>
                      )}

                      {application.status === 'rejected' && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">Application Not Successful</h4>
                          <p className="text-red-400 text-sm">
                            Your application has been reviewed and was not accepted for this program.
                          </p>
                        </div>
                      )}

                      {application.admissionLetter && (
                        <div className="flex items-center space-x-2 text-white/70 mb-2">
                          <FaFileDownload className="text-white/70" />
                          <span className="text-sm">Admission Letter: </span>
                          <button
                            onClick={() => handleDownloadLetter(application)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Download
                          </button>
                        </div>
                      )}

                      {application.studentResponse && (
                        <div className="text-sm text-white/70">
                          Your response: <span className={application.studentResponse === 'accepted' ? 'text-green-400' : 'text-red-400'}>
                            {application.studentResponse}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                      {/* Show accept/decline for approved applications */}
                      {application.status === 'approved' && !application.studentResponse && (
                        <>
                          <button 
                            onClick={() => handleAcceptOffer(application)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            Accept Offer
                          </button>
                          <button 
                            onClick={() => handleDeclineOffer(application)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {/* Show status for responded applications */}
                      {application.studentResponse && (
                        <button className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-default ${
                          application.studentResponse === 'accepted' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {application.studentResponse === 'accepted' ? 'Offer Accepted' : 'Offer Declined'}
                        </button>
                      )}
                      
                      {/* Show admitted status */}
                      {application.status === 'admitted' && (
                        <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-default">
                          Admitted
                        </button>
                      )}

                      {/* Show rejected status */}
                      {application.status === 'rejected' && (
                        <button className="bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-default">
                          Not Accepted
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="text-sm" />
      <span>{config.label}</span>
    </span>
  );
}