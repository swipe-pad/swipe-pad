"use client"

import { useApp } from "@/context/AppContext"
import { UserProfile } from "@/components/user-profile"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const router = useRouter()
    const { userStats } = useApp()

    return (
        <div className="px-6 py-6">
            <UserProfile stats={userStats} onBack={() => router.back()} />
        </div>
    )
}
