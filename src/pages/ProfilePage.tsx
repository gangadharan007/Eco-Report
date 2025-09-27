import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth"
import { auth, db } from "../lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiLogOut } from "react-icons/fi"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [uid, setUid] = useState("")
  const [phone, setPhone] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [newImage, setNewImage] = useState<File | null>(null)
  const [previewURL, setPreviewURL] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setName(u.displayName || "")
        setEmail(u.email || "")
        setUid(u.uid)
        setPhotoURL(u.photoURL || "")
      } else {
        navigate("/login")
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleImageUpload = async (): Promise<string | null> => {
    if (!newImage) return null
    const formData = new FormData()
    formData.append("image", newImage)

    const res = await fetch("https://api.imgbb.com/1/upload?key=05b9cbb686f40bed24d9a20eb7268244", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    return data?.data?.url || null
  }

  const handleUpdate = async () => {
    setMessage("")
    setLoading(true)
    try {
      let uploadedImageUrl = photoURL
      if (newImage) {
        const imgUrl = await handleImageUpload()
        if (imgUrl) uploadedImageUrl = imgUrl
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: uploadedImageUrl,
        })

        await setDoc(doc(db, "users", uid), {
          name,
          phone,
          email,
          photoURL: uploadedImageUrl,
        })

        setPhotoURL(uploadedImageUrl)
        setNewImage(null)
        setPreviewURL("")
        setMessage("✅ Profile updated successfully!")
      }
    } catch (error) {
      console.error("Update failed:", error)
      setMessage("❌ Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setNewImage(file || null)
    if (file) {
      setPreviewURL(URL.createObjectURL(file))
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 p-4">
      {/* 🔓 Logout Button */}
      <div className="flex justify-end max-w-4xl mx-auto mb-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-full shadow transition"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 max-w-xl mx-auto p-8 rounded-2xl shadow-xl backdrop-blur-sm text-green-900"
      >
        <h2 className="text-3xl font-bold text-center mb-6">👤 Profile Settings</h2>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center font-medium mb-4 ${
              message.startsWith("✅") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </motion.p>
        )}

        <div className="flex flex-col items-center gap-4">
          {/* 👤 Profile Image + Preview */}
          <div className="relative group flex flex-col items-center">
            <img
              src={previewURL || photoURL || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-green-600 shadow-md transition-transform group-hover:scale-105"
            />
            {previewURL && (
              <p className="text-xs text-yellow-600 mt-1 animate-pulse">
                Previewing new image (not saved yet)
              </p>
            )}
            <label className="mt-2 text-sm cursor-pointer bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* 📄 Name and Phone */}
          <input
            type="text"
            placeholder="Full Name"
            className="p-3 rounded-lg w-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number (optional)"
            className="p-3 rounded-lg w-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* 📧 Read-only Info */}
          <div className="w-full text-left mt-2 text-sm text-gray-600 bg-white/50 p-3 rounded-md">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>User ID:</strong> {uid}</p>
          </div>

          {/* ✅ Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading || (!newImage && !name.trim())}
            className={`mt-4 w-full py-3 rounded-lg font-semibold text-white transition duration-200 ${
              loading || (!newImage && !name.trim())
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
