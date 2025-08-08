"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomeRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/face-swap")
  }, [router])
  return null
}
