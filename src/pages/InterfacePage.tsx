import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FaLeaf,
  FaSignInAlt,
  FaUserPlus,
  FaCloudUploadAlt,
  FaMapMarkedAlt,
  FaCheckCircle,
} from "react-icons/fa"

export default function InterfacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-500 text-green-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 py-20 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-white/80 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-md mb-4"
          >
            <FaLeaf className="text-4xl text-green-700" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Eco Report: A Platform for Environmental Action
          </h1>
          <p className="text-lg md:text-xl text-green-800/80 mb-6">
            Report environmental issues like pollution, garbage, or deforestation with photo,
            category & location. Help make our planet cleaner and greener.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <button className="bg-green-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-green-800 transition">
                <FaSignInAlt /> Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-white/90 text-green-800 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white transition border border-green-700">
                <FaUserPlus /> Register
              </button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 py-16 bg-white/20 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[{
              icon: <FaCloudUploadAlt className="text-4xl mx-auto text-green-700 mb-3" />,
              title: "Submit Report",
              desc: "Provide title, description, photo, category & your location auto-fills."
            }, {
              icon: <FaMapMarkedAlt className="text-4xl mx-auto text-green-700 mb-3" />,
              title: "Track Progress",
              desc: "Check real-time status whether your report is pending or resolved."
            }, {
              icon: <FaCheckCircle className="text-4xl mx-auto text-green-700 mb-3" />,
              title: "Admin Action",
              desc: "Admins review, validate, and act on reports. They may resolve or export them."
            }].map(({ icon, title, desc }, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/60 p-6 rounded-xl shadow hover:shadow-xl transition"
              >
                {icon}
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-green-800/80 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Who Can Use Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="px-6 py-16"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Who Can Use Eco Report?</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white/70 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">🌍 Users</h3>
              <ul className="list-disc list-inside text-green-900/80 text-sm space-y-2">
                <li>Login and report issues from your dashboard</li>
                <li>Attach photos and track your submission status</li>
                <li>Auto-detected location helps identify issue spots</li>
                <li>Download all your reports if needed</li>
              </ul>
            </div>
            <div className="bg-white/70 p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-2">🛡️ Admins</h3>
              <ul className="list-disc list-inside text-green-900/80 text-sm space-y-2">
                <li>View all user reports with location & image</li>
                <li>Change status of reports or delete spam</li>
                <li>Export reports to PDF or CSV for records</li>
                <li>Monitor issue trends with charts and filters</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center text-green-900/80 text-sm py-6 bg-white/10 backdrop-blur">
        © {new Date().getFullYear()} Eco Report · Built with 💚 for a cleaner tomorrow
      </footer>
    </div>
  )
}
