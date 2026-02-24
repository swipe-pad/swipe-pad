"use client"

import { useApp } from "@/context/AppContext"
import { UserProfile } from "@/components/user-profile"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const router = useRouter()
    const userStats = useApp((state) => state.userStats)

    return (
        <div className="p-6">
            <UserProfile stats={userStats} onBack={() => router.back()} />
        </div>
    )
}
