import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaGraduationCap, 
  FaUniversity, 
  FaBuilding, 
  FaArrowRight,
  FaCheck
} from "react-icons/fa";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

export default function Home() {
  return (
    <div className="min/h-screen bg-white text-gray-900">
      <Navbar />

      {/* HERO – Clean & Airy */}
      <section className="pt-36 pb-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8 leading-tight">
              Build your future
              <br />
              <span className="text-gray-500">in Lesotho</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              One platform to apply to universities, discover programs, and connect with employers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ROLE CARDS – Light, Elegant, Minimal */}
      <section className="px-6 -mt-12 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaGraduationCap,
                title: "I’m a student",
                benefits: ["Apply to any university", "Track applications", "Get job matches"],
                cta: "Start applying"
              },
              {
                icon: FaUniversity,
                title: "I’m a university",
                benefits: ["Receive applications", "Manage admissions", "Promote programs"],
                cta: "Join as partner"
              },
              {
                icon: FaBuilding,
                title: "I’m an employer",
                benefits: ["Post jobs & internships", "Find verified graduates", "Hire faster"],
                cta: "Find talent"
              }
            ].map((role, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-400 transition-all duration-300 cursor-pointer group
                  ${i === 0 ? 'border-gray-400' : ''}`}
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform">
                  <role.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-5 capitalize">{role.title}</h3>
                <ul className="space-y-3 mb-8 text-sm text-gray-600">
                  {role.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <FaCheck className="text-gray-500 text-xs" />
                      <span className="font-light">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="block text-center text-gray-900 font-medium text-sm tracking-wide hover:text-black transition"
                >
                  {role.cta} <FaArrowRight className="inline ml-1 text-xs" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS – Subtle & Classy */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-10 text-center">
            {[
              { number: "50+", text: "Universities & colleges" },
              { number: "200+", text: "Programs available" },
              { number: "5,000+", text: "Students connected" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="text-5xl font-light text-gray-900">{stat.number}</div>
                <p className="text-sm text-gray-600 mt-2 font-light">{stat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA – Clean Contrast */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
              Start your journey today
            </h2>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light">
              Join thousands already building their careers with CareerGuide Lesotho.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                to="/register"
                className="bg-white text-black px-10 py-5 rounded-2xl font-medium text-base hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <FaGraduationCap className="text-lg" />
                Get started — free
              </Link>
              <Link
                to="/login"
                className="border-2 border-white px-10 py-5 rounded-2xl font-medium text-base hover:bg-white hover:text-black transition"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}