import { useEffect, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { FaHome, FaSignOutAlt, FaClipboardList, FaPaperPlane } from "react-icons/fa"
import { ImSpinner2 } from "react-icons/im"

export default function Navbar() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email ?? "") // ✅ Show correct signed-in email
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setRole(docSnap.data().role || "")
        }
      } else {
        navigate("/")
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="bg-white/40 backdrop-blur-md shadow-md py-4 px-6 flex justify-between items-center">
      <Link to={role === "admin" ? "/admin" : "/user"} className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
        <FaHome />
        Eco Report
      </Link>

      {loading ? (
        <ImSpinner2 className="animate-spin text-emerald-700 text-xl" />
      ) : (
        <div className="flex gap-4 items-center">
          {role !== "admin" && (
            <>
              <Link
                to="/submit"
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isActive("/submit")
                    ? "bg-emerald-700 text-white"
                    : "hover:text-emerald-700"
                }`}
              >
                <FaPaperPlane />
                Submit
              </Link>

              <Link
                to="/status"
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isActive("/status")
                    ? "bg-emerald-700 text-white"
                    : "hover:text-emerald-700"
                }`}
              >
                <FaClipboardList />
                Status
              </Link>
            </>
          )}

          <div className="text-sm text-gray-700 hidden sm:block">{email}</div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
