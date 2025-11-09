import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import Home from "./pages/Home";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyEmail from "./components/auth/VerifyEmail";
// import ForgotPassword from "./components/auth/ForgotPassword"; 

import StudentDashboard from "./pages/student/StudentDashboard";
import CourseApplications from "./components/student/CourseApplications";
import AdmissionsResults from "./components/student/AdmissionsResults";
import DocumentUpload from "./components/student/DocumentUpload";
import JobOpportunities from "./components/student/JobOpportunities";
import Notifications from "./components/student/Notifications";
import Profile from "./components/student/StudentProfile";

import InstituteDashboard from "./pages/institute/InstituteDashboard";
import InstituteProfile from "./components/institute/InstituteProfile";
import ManageFaculties from "./components/institute/ManageFaculties";
import ManageCourses from "./components/institute/ManageCourses";
import StudentApplications from "./components/institute/StudentApplications";
import PublishAdmissions from "./components/institute/PublishAdmissions";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./components/company/PostJob";
import JobApplications from "./components/company/JobApplications";
import CompanyProfile from "./components/company/CompanyProfile";
import CompanyNotifications from "./components/company/CompanyNotifications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageInstitutions from "./components/admin/ManageInstitutions";
import ManageCoursesAdmin from "./components/admin/ManageCourses";
import ManageCompanies from "./components/admin/ManageCompanies";
import Reports from "./components/admin/Reports";
import AdminUsers from "./components/admin/AdminUsers";
import AdminAdmissions from "./components/admin/AdminAdmissions";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login/" element={<Login />} />
        <Route path="/register/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<CourseApplications />} />
        <Route path="/student/admissions" element={<AdmissionsResults />} />
        <Route path="/student/documents" element={<DocumentUpload />} />
        <Route path="/student/jobs" element={<JobOpportunities />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/profile" element={<Profile />} />

        <Route path="/institute/dashboard" element={<InstituteDashboard />} />
        <Route path="/institute/profile" element={<InstituteProfile />} />
        <Route path="/institute/faculties" element={<ManageFaculties />} />
        <Route path="/institute/courses" element={<ManageCourses />} />
        <Route path="/institute/applications" element={<StudentApplications />} />
        <Route path="/institute/admissions" element={<PublishAdmissions />} />

        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/company/post-job" element={<PostJob />} />
        <Route path="/company/applications" element={<JobApplications />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/notifications" element={<CompanyNotifications />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/institutions" element={<ManageInstitutions />} />
        <Route path="/admin/courses" element={<ManageCoursesAdmin />} />
        <Route path="/admin/companies" element={<ManageCompanies />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/admissions" element={<AdminAdmissions />} />
      </Routes>

    
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}

export default App;
