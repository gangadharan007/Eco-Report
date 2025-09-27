import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaLeaf, FaUserCircle, FaPlusCircle, FaClipboardList } from "react-icons/fa"

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300 text-green-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaLeaf className="text-green-700" /> Eco Report
        </h1>
        <Link
          to="/profile"
          className="flex items-center gap-2 text-green-700 font-medium hover:underline"
        >
          <FaUserCircle className="text-2xl" /> Profile
        </Link>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-6 py-10 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Eco Report 🌿</h2>
          <p className="text-lg text-green-800/80 mb-6">
            Report environmental issues such as pollution, garbage, or deforestation. Submit with a photo and location, and track their status in real time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/submit">
              <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full flex items-center gap-2 transition font-medium">
                <FaPlusCircle /> Submit Report
              </button>
            </Link>
            <Link to="/status">
              <button className="bg-white border border-green-700 text-green-800 px-6 py-3 rounded-full flex items-center gap-2 hover:bg-green-100 transition font-medium">
                <FaClipboardList /> View Status
              </button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Scrollable Images */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="overflow-x-auto whitespace-nowrap px-6 py-6"
      >
        <div className="flex gap-6">
          {[1, 2, 3, 4].map((n) => (
            <motion.img
              key={n}
              src={new URL(`../assets/image${n}.jpg`, import.meta.url).href}
              alt={`Eco example ${n}`}
              className="w-64 h-40 object-cover rounded-xl shadow-md hover:scale-105 transition-transform"
              whileHover={{ scale: 1.05 }}
            />
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center text-green-800 text-sm py-4 bg-white/50 mt-10">
        © {new Date().getFullYear()} Eco Report. Made with 💚 for a greener planet.
      </footer>
    </div>
  )
}
