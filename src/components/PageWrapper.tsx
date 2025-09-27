import { motion } from "framer-motion"

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-6 bg-gradient-to-br from-green-50 to-emerald-100"
    >
      {children}
    </motion.div>
  )
}
