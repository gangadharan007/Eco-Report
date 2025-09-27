// src/pages/ReportStatus.tsx
import { useState, useEffect } from "react"
import { auth, db } from "../lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaTrash } from "react-icons/fa"
import Navbar from "../components/Navbar"

type Report = {
  id: string
  title: string
  description: string
  category: string
  status: string
  createdAt?: Timestamp
}

const STATUS_STEPS = ["submitted", "reviewing", "resolved"]

export default function ReportStatus() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email)
        const q = query(collection(db, "reports"), where("email", "==", user.email))
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Report, "id">),
          }))
          setReports(data)
          setLoading(false)
        })

        return () => unsubscribeSnapshot()
      } else {
        navigate("/")
      }
    })

    return () => unsubscribeAuth()
  }, [navigate])

  const getStatusStep = (status: string) => STATUS_STEPS.indexOf(status)

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this report?")
    if (confirmDelete) {
      await deleteDoc(doc(db, "reports", id))
    }
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-green-800 mb-1">Your Report Status</h2>

        {userEmail && (
          <p className="text-sm text-gray-600 mb-4">
            Logged in as: <span className="font-medium">{userEmail}</span>
          </p>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-600">No reports submitted yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-5 rounded-xl shadow border border-green-200 relative"
              >
                <h3 className="text-lg font-bold text-green-800 mb-1">{report.title}</h3>
                <p className="text-gray-700">{report.description}</p>
                <p className="text-sm text-gray-600 mt-1">Category: {report.category}</p>
                <p className="text-sm text-gray-600 mb-3">
                  Submitted: {report.createdAt?.toDate().toLocaleString() || "N/A"}
                </p>

                {/* Step Progress Tracker */}
                <div className="flex items-center justify-between text-sm mb-4 relative">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex-1 text-center relative">
                      <div
                        className={`w-4 h-4 mx-auto rounded-full z-10 ${
                          i <= getStatusStep(report.status)
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      />
                      <p
                        className={`mt-1 ${
                          i <= getStatusStep(report.status)
                            ? "text-green-700 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </p>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="absolute top-2 left-1/2 w-full h-1 -z-10 bg-gray-300">
                          <div
                            className="bg-green-600 h-1 transition-all duration-300"
                            style={{
                              width:
                                i < getStatusStep(report.status) ? "100%" : "0%",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm mt-2">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      report.status === "resolved"
                        ? "text-green-600"
                        : report.status === "reviewing"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </p>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(report.id)}
                  className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}