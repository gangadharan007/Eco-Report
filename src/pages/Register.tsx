import { useState } from "react"
import { auth, db } from "../lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate, Link } from "react-router-dom"
import { FaUser, FaLock } from "react-icons/fa"
import { motion } from "framer-motion"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      await setDoc(doc(db, "users", uid), {
        email,
        role,
      })

      navigate(role === "admin" ? "/admin" : "/user")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-emerald-600 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-3xl shadow-lg w-full max-w-sm text-white space-y-6"
      >
        <div className="text-center">
          <div className="bg-white rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-md">
            <img src="/logo.jpeg" alt="Eco Report" className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mt-4">Create Account</h1>
        </div>

        {error && <p className="text-red-200 text-sm text-center">{error}</p>}

        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-green-900" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-20 border border-white focus:outline-none focus:ring-2 focus:ring-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-green-900" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-20 border border-white focus:outline-none focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <select
          className="w-full px-4 py-2 rounded-full bg-white bg-opacity-20 border border-white text-white focus:outline-none focus:ring-2 focus:ring-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-white text-green-800 font-bold py-2 rounded-full shadow hover:bg-white/90 transition"
        >
          {loading ? "Registering..." : "REGISTER"}
        </button>

        <p className="text-sm text-center text-white/80">
          Already have an account?{" "}
          <Link to="/" className="underline text-white font-medium">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
