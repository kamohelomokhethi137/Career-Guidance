import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaGraduationCap,FaUser , FaUniversity, FaBuilding, FaUserShield, FaEnvelope } from 'react-icons/fa';

const roleConfig = {
  student: {
    icon: FaGraduationCap,
    title: 'Student Login',
    description: 'Access your student dashboard to apply for courses and track your applications',
    color: 'border-blue-200'
  },
  institute: {
    icon: FaUniversity,
    title: 'Institution Login',
    description: 'Manage your institution profile, courses, and student applications',
    color: 'border-green-200'
  },
  company: {
    icon: FaBuilding,
    title: 'Company Login',
    description: 'Post job opportunities and review qualified applicants',
    color: 'border-purple-200'
  },
  admin: {
    icon: FaUserShield,
    title: 'Admin Login',
    description: 'System administration and management',
    color: 'border-red-200'
  }
};

// Special config for non-role routes
const routeConfig = {
  'register': {
    icon: FaUser,
    title: 'Create Your Account',
    description: 'Select your role and fill in your details',
    color: 'border-gray-200'
  },
  'login': {
    icon: FaUser,
    title: 'Welcome Back',
    description: 'Sign in to your account to continue',
    color: 'border-gray-200'
  }
};

export default function AuthLayout({ children, type = 'login', heading, subHeading }) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Get role from URL search params
  const searchParams = new URLSearchParams(location.search);
  const roleFromParams = searchParams.get('role');
  
  // Determine current route and role
  const currentRoute = pathSegments[pathSegments.length - 1] || 'login';
  const isSpecialRoute = routeConfig[currentRoute];
  
  let config;
  let role;

  if (isSpecialRoute) {
    // For special routes like verify-email, register, login
    config = routeConfig[currentRoute];
    role = roleFromParams || ''; // Use role from params if available
  } else if (roleConfig[currentRoute]) {
    // For backward compatibility with old URL structure
    config = roleConfig[currentRoute];
    role = currentRoute;
  } else {
    // Default fallback
    config = routeConfig[type] || routeConfig.login;
    role = '';
  }

  // Use custom headings if provided, otherwise use default
  const displayHeading = heading || config.title;
  const displaySubHeading = subHeading || config.description;

  // Determine auth switch links
  const getAuthSwitchLink = () => {
    if (role) {
      // If we have a role, use role-based links
      return type === 'login' ? `/register?role=${role}` : `/login?role=${role}`;
    } else {
      // If no role, use simple links
      return type === 'login' ? '/register' : '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${config.color}`}>
              <config.icon className="text-2xl text-gray-700" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              {displayHeading}
            </h1>
            <p className="text-gray-600 text-sm">
              {displaySubHeading}
            </p>
          </div>

          {children}

          {/* Auth Switch - Hide for verify-email page */}
          {!location.pathname.includes('verify-email') && (
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {type === 'login' ? "Don't have an account? " : "Already have an account? "}
                <Link 
                  to={getAuthSwitchLink()}
                  className="font-semibold text-black hover:text-gray-700 transition-colors"
                >
                  {type === 'login' ? 'Register here' : 'Login here'}
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}