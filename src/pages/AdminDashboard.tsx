import { useEffect, useState } from "react"
import { db } from "../lib/firebase"
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  getDocs,
} from "firebase/firestore"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import Papa from "papaparse"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { FaMapMarkerAlt } from "react-icons/fa"
import { MdOutlineImage } from "react-icons/md"
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"

type Report = {
  id: string
  title: string
  description: string
  category: string
  email: string
  phone?: string
  status: string
  createdAt?: Timestamp
  imageUrl?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
}

type User = {
  uid: string
  name: string
  email: string
  phone?: string
  photoURL?: string
}

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac"]
const ITEMS_PER_PAGE = 5

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch Reports
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Report[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Report, "id">),
      }))
      setReports(data)
    })
    return () => unsubscribe()
  }, [])

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"))
        const allUsers: User[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          allUsers.push({
            uid: doc.id,
            name: data.name || "Unnamed",
            email: data.email,
            phone: data.phone || "",
            photoURL: data.photoURL || "",
          })
        })
        setUsers(allUsers)
      } catch (error) {
        console.error("Failed to fetch users", error)
      }
    }

    fetchUsers()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "reports", id), { status: newStatus })
  }

  const deleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteDoc(doc(db, "reports", id))
    }
  }

  const handleEditUser = async (uid: string, currentName: string, currentPhone: string) => {
    const newName = prompt("Edit name:", currentName)
    if (newName === null) return

    const newPhone = prompt("Edit phone number:", currentPhone)
    if (newPhone === null) return

    try {
      await updateDoc(doc(db, "users", uid), {
        name: newName,
        phone: newPhone,
      })
      alert("User updated successfully")
    } catch (err) {
      console.error("Update failed", err)
      alert("Failed to update user")
    }
  }

  const handleDeleteUser = async (uid: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", uid))
        alert("User deleted")
      } catch (err) {
        console.error("Delete failed", err)
        alert("Failed to delete user")
      }
    }
  }

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      reports.map(({ id, title, description, category, email, phone, status }) => ({
        ID: id,
        Title: title,
        Description: description,
        Category: category,
        Email: email,
        Phone: phone || "",
        Status: status,
      }))
    )
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "eco-reports.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = reports.filter(
    (r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const chartData = Object.entries(
    reports.reduce((acc: Record<string, number>, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {})
  ).map(([category, value]) => ({ name: category, value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-emerald-600 p-6">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/30 backdrop-blur-xl p-6 rounded-2xl shadow-lg max-w-6xl mx-auto text-green-900"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

        {/* Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-3">Category Distribution</h2>
          <div className="bg-white/50 p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-full w-full sm:w-64 bg-white/70 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded-full bg-white/70"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Export CSV
          </button>
        </div>

        {/* Reports List */}
        <div className="grid gap-4">
          {paginated.map((r) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 p-4 rounded-xl shadow"
            >
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="text-gray-700">{r.description}</p>
              <p className="text-sm mt-1">📁 Category: {r.category}</p>
              <p className="text-sm">✉️ Email: {r.email}</p>
              {r.phone && <p className="text-sm">📞 Phone: {r.phone}</p>}
              <p className="text-sm font-semibold mt-1">
                Status:{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    r.status === "resolved"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-white"
                  }`}
                >
                  {r.status}
                </span>
              </p>

              {/* Image */}
              {r.imageUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium flex items-center gap-2 mb-1">
                    <MdOutlineImage className="text-xl" /> Photo:
                  </p>
                  <img
                    src={r.imageUrl}
                    alt="Report"
                    className="w-full max-w-xs rounded shadow"
                  />
                </div>
              )}

              {/* Location */}
              {r.location?.lat && r.location?.lng && (
                <div className="mt-3">
                  <p className="text-sm font-medium flex items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="text-xl" /> Location:
                  </p>
                  <p className="text-sm text-green-800 mb-2">
                    📍 {r.location.address ||
                      `Lat: ${r.location.lat.toFixed(4)}, Lng: ${r.location.lng.toFixed(4)}`}
                  </p>
                  <div className="rounded overflow-hidden mt-2" style={{ aspectRatio: "16/9" }}>
                    <MapContainer
                      center={[r.location.lat, r.location.lng] as LatLngExpression}
                      zoom={13}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <Marker position={[r.location.lat, r.location.lng] as LatLngExpression}>
                        <LeafletTooltip>{r.title}</LeafletTooltip>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(r.id, "pending")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-full"
                >
                  Pending
                </button>
                <button
                  onClick={() => updateStatus(r.id, "resolved")}
                  className="bg-green-600 text-white px-3 py-1 rounded-full"
                >
                  Resolved
                </button>
                <button
                  onClick={() => deleteReport(r.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-full"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-full ${
                currentPage === i + 1 ? "bg-green-700 text-white" : "bg-white text-green-800"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Users Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-900">
            👥 Registered Users
          </h2>
          {users.length === 0 ? (
            <p className="text-center text-sm text-gray-600">No users found.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {users.map((user) => (
                <motion.div
                  key={user.uid}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 p-4 rounded-xl shadow border"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={user.photoURL || "https://via.placeholder.com/60"}
                      alt="User"
                      className="w-16 h-16 rounded-full border-2 border-green-600 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800">📞 Phone: {user.phone || "—"}</p>
                  <p className="text-xs text-gray-500 mt-1 break-all">UID: {user.uid}</p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleEditUser(user.uid, user.name, user.phone || "")
                      }
                      className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="px-3 py-1 bg-red-600 text-white rounded-full text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
