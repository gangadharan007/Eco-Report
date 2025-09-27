// src/routes/AppRouter.tsx
import { Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Register"
import InterfacePage from "../pages/InterfacePage" // ✅ NEW
import SubmitReportPage from "../pages/SubmitReport" // ✅ RENAMED
import ReportStatusPage from "../pages/ReportStatus" // ✅ NEW
import AdminDashboard from "../pages/AdminDashboard"
import NotFound from "../pages/NotFound"
import ProfilePage from "../pages/ProfilePage"
import UserDashboard from "../pages/UserDashboard"

export default function AppRouter() {
  return (
    <Routes>
       <Route path="/" element={<InterfacePage />} /> {/* Interface Landing Page */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user" element={<UserDashboard />} /> {/* User Dashboard */}
      <Route path="/submit" element={<SubmitReportPage />} /> {/* Report Submission */}
      <Route path="/status" element={<ReportStatusPage />} /> {/* Status Tracking */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}