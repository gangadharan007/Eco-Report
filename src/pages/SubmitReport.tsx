import { useState, useEffect } from "react"
import { db, auth } from "../lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

type LocationType = {
  lat: number | null
  lng: number | null
  address?: string
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function SubmitReport() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("pollution")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [location, setLocation] = useState<LocationType>({ lat: null, lng: null })
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) setUserEmail(user.email)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      const data = await response.json()
      setLocation({ lat: latitude, lng: longitude, address: data.display_name })
    })
  }, [])

  function LocationPicker() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        setLocation({ lat, lng, address: data.display_name })
      },
    })
    return null
  }

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null
    const formData = new FormData()
    formData.append("image", imageFile)

    try {
      const response = await fetch(
        "https://api.imgbb.com/1/upload?key=05b9cbb686f40bed24d9a20eb7268244",
        { method: "POST", body: formData }
      )
      const result = await response.json()
      return result?.data?.url || null
    } catch (err: unknown) {
      console.warn("Image upload failed:", err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const user = auth.currentUser
    console.log("Submitting as user:", user)

    if (!user) {
      setError("⚠️ You must be logged in to submit a report.")
      return
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError("📵 Please enter a valid 10-digit Indian phone number.")
      return
    }

    setLoading(true)
    try {
      const imageUrl = await handleImageUpload()

      const reportData = {
        title,
        description,
        category,
        phone,
        email: userEmail || "anonymous",
        uid: user.uid,
        createdAt: Timestamp.now(),
        status: "pending",
        location,
        imageUrl,
      }

      await addDoc(collection(db, "reports"), reportData)

      // Optional webhook (wrap in try-catch)
      try {
        await fetch("https://webhook.site/d5e7e76f-e1e8-48d5-af19-0f92f1ae7e03", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        })
      } catch (err: unknown) {
        console.warn("Webhook failed but continuing:", err)
      }

      setSuccess("✅ Report submitted and forwarded successfully!")
      setTitle("")
      setDescription("")
      setCategory("pollution")
      setPhone("")
      setImageFile(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error submitting report:", err)
        setError(`❌ Failed to submit report: ${err.message}`)
      } else {
        console.error("❌ Unknown error:", err)
        setError("❌ Failed to submit report due to unknown error.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-500">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/30 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-lg text-green-900"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Submit Eco Report</h2>

          {error && <p className="text-red-700 text-sm text-center mb-2">{error}</p>}
          {success && <p className="text-green-700 text-sm text-center mb-2">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full bg-white/70"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-2xl bg-white/70"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white/70"
            >
              <option value="pollution">Pollution</option>
              <option value="garbage">Garbage</option>
              <option value="deforestation">Deforestation</option>
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-full bg-white/70"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-700"
            />

            {location.lat && location.lng && (
              <>
                <p className="text-sm text-green-800">
                  📍 Location:{" "}
                  {location.address ?? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                </p>
                <div className="rounded overflow-hidden mt-2" style={{ aspectRatio: "16/9" }}>
                  <MapContainer
                    center={[location.lat, location.lng] as LatLngExpression}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationPicker />
                    <Marker
                      position={[location.lat, location.lng] as LatLngExpression}
                      icon={markerIcon}
                      draggable
                      eventHandlers={{
                        dragend: async (e) => {
                          const marker = e.target
                          const pos = marker.getLatLng()
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`
                          )
                          const data = await response.json()
                          setLocation({
                            lat: pos.lat,
                            lng: pos.lng,
                            address: data.display_name,
                          })
                        },
                      }}
                    />
                  </MapContainer>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-2 rounded-full"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
