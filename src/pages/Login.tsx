import { useState } from "react"
import { auth, db } from "../lib/firebase"
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid
      const docSnap = await getDoc(doc(db, "users", uid))
      if (docSnap.exists()) {
        const role = docSnap.data().role
        navigate(role === "admin" ? "/admin" : "/user")
      } else {
        setError("User role not found.")
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(userRef)

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: "user",
        })
      }

      const role = docSnap.exists() ? docSnap.data().role : "user"
      navigate(role === "admin" ? "/admin" : "/user")
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("Google sign-in failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.")
      return
    }

    setLoading(true)
    setError("")
    try {
      await sendPasswordResetEmail(auth, email)
      setError("✅ Password reset email sent. Check your inbox.")
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("Failed to send reset email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-500 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md text-green-900"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
            <span className="text-3xl">🌿</span>
          </div>
          <h2 className="text-2xl font-bold mt-3">Welcome to Eco Report</h2>
          <p className="text-green-800/70 text-sm">Log in to your account</p>
        </div>

        {error && <p className="text-sm text-center mb-4 text-red-600">{error}</p>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-full bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-between text-sm px-1">
            <label className="flex items-center space-x-2 text-green-800">
              <input type="checkbox" className="accent-green-700" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-green-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-full transition font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-green-700 py-2 rounded-full flex items-center justify-center gap-2 border border-green-200 hover:bg-green-50"
          >
            <FcGoogle className="text-xl" />
            Sign in with Google
          </button>

          <p className="text-sm text-center text-green-900/80 mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="font-semibold underline text-green-900 hover:text-green-700">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
