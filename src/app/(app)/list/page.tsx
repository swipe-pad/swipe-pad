"use client"

import { useApp } from "@/context/AppContext"
import { ToggleMenu } from "@/components/toggle-menu"
import { CategorySection } from "@/components/category-section"
import { projects, categories } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function ListPage() {
    const router = useRouter()
    const { cart, setCart, setUserStats } = useApp()

    const projectsByCategory = categories.reduce(
        (acc: any, category: string) => {
            const categoryProjects = projects.filter((project) => project.category === category)
            if (categoryProjects.length > 0) acc[category] = categoryProjects
            return acc
        }, {} as Record<string, typeof projects>
    )

    const handleDonate = (project: any, amount = 5) => {
        setCart([...cart, { project, amount, currency: "cUSD" }])
        setUserStats((prev: any) => ({
            ...prev,
            totalDonations: prev.totalDonations + 1,
            lastDonation: new Date(),
        }))
    }

    return (
        <div className="py-6">
            <ToggleMenu viewMode="list" setViewMode={(mode) => mode === 'swipe' && router.push('/')} />
            <div className="px-6 space-y-8">
                {Object.entries(projectsByCategory).map(([category, categoryProjects]) => (
                    <CategorySection
                        key={category}
                        category={category}
                        projects={categoryProjects as any}
                        onDonate={handleDonate}
                    />
                ))}
            </div>
        </div>
    )
}
