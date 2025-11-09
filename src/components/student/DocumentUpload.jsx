import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaFilePdf, FaTrash, FaCheckCircle, FaGraduationCap } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import StudentSidebar from '../../components/student/Sidebar';
import StudentTopNav from '../../components/student/TopNav';

const initialDocuments = [
  { id: 1, name: 'High School Transcript.pdf', type: 'transcript', uploaded: '2024-01-10', status: 'verified' },
  { id: 2, name: 'National ID.pdf', type: 'identification', uploaded: '2024-01-10', status: 'verified' },
  { id: 3, name: 'Birth Certificate.pdf', type: 'identification', uploaded: '2024-01-10', status: 'pending' }
];

const statusConfig = {
  verified: { text: 'Verified', color: 'text-green-400 bg-green-900' },
  rejected: { text: 'Rejected', color: 'text-red-400 bg-red-900' },
  pending: { text: 'Pending Review', color: 'text-yellow-400 bg-yellow-900' }
};

export default function DocumentUpload() {
  const currentUser = localStorage.getItem('currentUser') || 'user';

  const [documents, setDocuments] = useState(initialDocuments.filter(d => d.type !== 'transcript'));
  const [transcripts, setTranscripts] = useState(initialDocuments.filter(d => d.type === 'transcript'));

  const handleFileUpload = (event, type) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type,
      uploaded: new Date().toISOString(),
      file,
      status: 'pending'
    }));

    type === 'transcript' ? setTranscripts([...transcripts, ...newDocs]) : setDocuments([...documents, ...newDocs]);
    toast.success(`${type === 'transcript' ? 'Transcript' : 'Document'} uploaded successfully!`);
    event.target.value = '';
  };

  const deleteDocument = (id, type) => {
    type === 'transcript'
      ? setTranscripts(transcripts.filter(doc => doc.id !== id))
      : setDocuments(documents.filter(doc => doc.id !== id));
    toast.info('Document removed');
  };

  const DocumentList = ({ list, type, color = 'text-gray-400' }) => (
    <>
      {list.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-black rounded-lg">
          <div className="flex items-center space-x-3">
            <FaFilePdf className={`text-${type === 'transcript' ? 'blue' : 'red'}-400`} />
            <div>
              <span className="text-sm text-white block">{doc.name}</span>
              <span className={`text-xs ${color}`}>Uploaded {new Date(doc.uploaded).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[doc.status]?.color}`}>
              {statusConfig[doc.status]?.text}
            </span>
            <button
              onClick={() => deleteDocument(doc.id, type)}
              className={`${type === 'transcript' ? 'text-blue-300' : 'text-gray-400'} hover:text-red-400 transition-colors p-1`}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-black min-h-screen text-white flex flex-col md:flex-row">
      <StudentSidebar />
      <div className="flex-1 md:ml-64">
        <StudentTopNav studentName={currentUser} />
        <main className="pt-20 px-4 md:px-8 lg:px-12 space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Documents & Transcripts</h1>
            <p className="text-white/70 text-sm md:text-base">
              Upload and manage your academic documents and certificates.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Required Documents */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Required Documents</h2>
              <div className="space-y-3 mb-4"><DocumentList list={documents} type="other" /></div>
              <FileUpload label="Upload additional documents" onChange={e => handleFileUpload(e, 'other')} borderColor="gray-700" iconColor="gray-400" />
            </motion.div>

            {/* Academic Transcripts */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-blue-400" /> Academic Transcripts
              </h2>
              <div className="space-y-3 mb-4"><DocumentList list={transcripts} type="transcript" color="text-blue-300" /></div>
              <FileUpload label="Upload transcripts & certificates" onChange={e => handleFileUpload(e, 'transcript')} borderColor="blue-700" iconColor="blue-400" note="For completed studies only" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Upload Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Accepted formats: PDF, DOC, DOCX, JPG, PNG', 'Maximum file size: 10MB per document', 'Ensure documents are clear and readable', 'Transcripts will be verified by institutions'].map((item, i) => (
                <li key={i} className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" />{item}</li>
              ))}
            </ul>
          </motion.div>
        </main>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}

const FileUpload = ({ label, onChange, borderColor, iconColor, note }) => (
  <label className="block">
    <div className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center cursor-pointer hover:border-gray-600 transition-colors bg-black`}>
      <FaUpload className={`mx-auto text-2xl ${iconColor} mb-2`} />
      <span className={`text-sm ${iconColor}`}>{label}</span>
      {note && <p className={`text-xs ${iconColor} mt-1`}>{note}</p>}
      <input type="file" multiple onChange={onChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
    </div>
  </label>
);
