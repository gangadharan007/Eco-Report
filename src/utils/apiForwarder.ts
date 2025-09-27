import type { Timestamp } from "firebase/firestore"

export type ReportData = {
  title: string
  description: string
  category: string
  phone: string
  email: string
  createdAt: Timestamp
  status: string
  location: {
    lat: number
    lng: number
    address?: string
  }
  imageUrl?: string
}

export const sendReportToGovAPI = async (report: ReportData): Promise<boolean> => {
  try {
    const apiPayload = {
      ...report,
      createdAt: report.createdAt.toDate().toISOString(), // Convert Firestore Timestamp
    }

    const response = await fetch("https://your-gov-api-endpoint.gov.in/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": Bearer ${process.env.YOUR_API_KEY}, // if needed
      },
      body: JSON.stringify(apiPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Government API error:", errorText)
      return false
    }

    console.log("✅ Report successfully sent to government")
    return true
  } catch (err) {
    console.error("❌ Network/API Error:", err)
    return false
  }
}