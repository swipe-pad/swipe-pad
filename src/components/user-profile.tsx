"use client"

import { useState } from "react"
import { Badge, Award, Bookmark, ArrowLeft, PlusCircle, Shield } from "lucide-react"
import { useProjects } from "@/lib/useConvexData"

interface UserProfileProps {
  stats: {
    totalDonations: number
    categoriesSupported: Set<string>
    streak: number
    lastDonation: Date | null
  }
  onBack: () => void
}

export function UserProfile({ stats, onBack }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "badges" | "saved" | "submit">("stats")
  const projects = useProjects()

  // Mock data for saved projects
  const savedProjects = projects.slice(0, 3)

  // Mock data for badges
  const userBadges = [
    {
      id: "first-swipe",
      name: "First Swipe",
      description: "Made your first donation",
      earned: stats.totalDonations > 0,
    },
    { id: "streak-5", name: "5-Day Streak", description: "Donated for 5 days in a row", earned: stats.streak >= 5 },
    {
      id: "category-champion",
      name: "Category Champion",
      description: "Supported 3+ different categories",
      earned: stats.categoriesSupported.size >= 3,
    },
    {
      id: "top-swiper",
      name: "Top Swiper",
      description: "Among top donors this week",
      earned: stats.totalDonations > 10,
    },
  ]

  return (
    <div className="rounded-xl bg-gray-900 p-5 shadow-lg">
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="mr-2">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-xl font-bold">Your Profile</h2>
      </div>

      <div className="mb-6 flex items-center justify-center">
        <div className="
          flex size-20 items-center justify-center rounded-full bg-gray-800
        ">
          <span className="text-2xl">👤</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <p className="text-sm text-gray-400">Total Donations</p>
          <p className="text-xl font-bold">{stats.totalDonations > 0 ? stats.totalDonations : "None"}</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <p className="text-sm text-gray-400">Current Streak</p>
          <p className="text-xl font-bold">{stats.streak > 0 ? `${stats.streak} days` : "None"}</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <p className="text-sm text-gray-400">Categories</p>
          <p className="text-xl font-bold">
            {stats.categoriesSupported.size > 0 ? stats.categoriesSupported.size : "None"}
          </p>
        </div>
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <p className="text-sm text-gray-400">Badges</p>
          <p className="text-xl font-bold">
            {userBadges.filter((b) => b.earned).length > 0 ? userBadges.filter((b) => b.earned).length : "None"}
          </p>
        </div>
      </div>

      <div className="mb-4 flex border-b border-gray-800">
        <button
          className={`
            flex-1 py-2 text-center
            ${activeTab === "stats" ? `
              border-b-2 border-[#FFD600] text-[#FFD600]
            ` : `text-gray-400`}
          `}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
        <button
          className={`
            flex-1 py-2 text-center
            ${activeTab === "badges" ? `
              border-b-2 border-[#FFD600] text-[#FFD600]
            ` : `text-gray-400`}
          `}
          onClick={() => setActiveTab("badges")}
        >
          Badges
        </button>
        <button
          className={`
            flex-1 py-2 text-center
            ${activeTab === "saved" ? `
              border-b-2 border-[#FFD600] text-[#FFD600]
            ` : `text-gray-400`}
          `}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>
        <button
          className={`
            flex-1 py-2 text-center
            ${activeTab === "submit" ? `
              border-b-2 border-[#FFD600] text-[#FFD600]
            ` : `text-gray-400`}
          `}
          onClick={() => setActiveTab("submit")}
        >
          Submit
        </button>
      </div>

      {activeTab === "stats" && (
        <div>
          <h3 className="mb-3 text-lg font-medium">Your Impact</h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Categories Supported</span>
                <span className="font-medium">{Array.from(stats.categoriesSupported).join(", ") || "None yet"}</span>
              </div>
            </div>
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Donation</span>
                <span className="font-medium">
                  {stats.lastDonation ? new Date(stats.lastDonation).toLocaleDateString() : "None yet"}
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-gray-800 p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Donation Streak</span>
                <span className="font-medium">{stats.streak > 0 ? `${stats.streak} days` : "None"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "badges" && (
        <div>
          <h3 className="mb-3 text-lg font-medium">Your Badges</h3>
          <div className="space-y-3">
            {userBadges.map((badge) => (
              <div
                key={badge.id}
                className={`
                  flex items-center rounded-lg p-3
                  ${badge.earned ? `bg-[#FFD600]/10` : `bg-gray-800`}
                `}
              >
                <div
                  className={`
                    mr-3 flex size-10 items-center justify-center rounded-full
                    ${badge.earned ? `bg-[#FFD600] text-black` : `
                      bg-gray-700 text-gray-500
                    `}
                  `}
                >
                  <Award className="size-5" />
                </div>
                <div className="flex-1">
                  <p className={`
                    font-medium
                    ${badge.earned ? "text-[#FFD600]" : `text-gray-400`}
                  `}>{badge.name}</p>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </div>
                {badge.earned && <Badge className="size-5 text-[#FFD600]" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "saved" && (
        <div>
          <h3 className="mb-3 text-lg font-medium">Saved Projects</h3>
          {savedProjects.length > 0 ? (
            <div className="space-y-4">
              {savedProjects.map((project) => (
                <div key={project.id} className="
                  flex items-center rounded-lg bg-gray-800 p-3
                ">
                  <img
                    src={project.imageUrl || "/placeholder.svg"}
                    alt={project.name}
                    className="mr-3 size-12 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-gray-400">{project.category}</p>
                  </div>
                  <button className="
                    rounded-lg bg-[#677FEB] px-3 py-1 text-sm text-white
                    hover:bg-[#5A6FD3]
                  ">
                    Donate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400">
              <Bookmark className="mx-auto mb-2 size-12 opacity-50" />
              <p>No saved projects yet</p>
              <p className="text-sm">Bookmark projects to find them here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "submit" && (
        <div>
          <h3 className="mb-3 text-lg font-medium">Submit Your Project</h3>
          <div className="mb-4 rounded-lg bg-gray-800 p-4">
            <p className="mb-4 text-sm text-gray-300">
              Want to list your project on SwipePad? Fill out the form below to get started.
            </p>

            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Project Name</label>
                <input
                  type="text"
                  className="
                    w-full rounded-lg bg-gray-700 px-3 py-2 text-white
                    placeholder-gray-500
                    focus:ring-2 focus:ring-[#677FEB] focus:outline-none
                  "
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Category</label>
                <select className="
                  w-full rounded-lg bg-gray-700 px-3 py-2 text-white
                  focus:ring-2 focus:ring-[#677FEB] focus:outline-none
                ">
                  <option value="">Select a category</option>
                  <option value="Education">Education</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Climate Action">Climate Action</option>
                  <option value="Animal Rescue">Animal Rescue</option>
                  <option value="Humanitarian Aid">Humanitarian Aid</option>
                  <option value="Art">Art</option>
                  <option value="Musicians">Musicians</option>
                  <option value="Content Creators">Content Creators</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <textarea
                  className="
                    w-full rounded-lg bg-gray-700 px-3 py-2 text-white
                    placeholder-gray-500
                    focus:ring-2 focus:ring-[#677FEB] focus:outline-none
                  "
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">Wallet Address (Celo)</label>
                <input
                  type="text"
                  className="
                    w-full rounded-lg bg-gray-700 px-3 py-2 text-white
                    placeholder-gray-500
                    focus:ring-2 focus:ring-[#677FEB] focus:outline-none
                  "
                  placeholder="0x..."
                />
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="terms" className="mr-2" />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I confirm my real identity and impact intentions
                </label>
              </div>

              <button
                type="submit"
                className="
                  flex w-full items-center justify-center rounded-lg
                  bg-[#677FEB] py-3 font-medium text-white transition-colors
                  hover:bg-[#5A6FD3]
                "
              >
                <PlusCircle className="mr-2 size-4" /> Submit Project
              </button>
            </form>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <div className="mb-3 flex items-start">
              <Shield className="mt-0.5 mr-2 size-5 text-[#FFD600]" />
              <h4 className="text-md font-medium">Project Verification</h4>
            </div>
            <p className="mb-2 text-sm text-gray-300">
              All projects undergo verification to ensure legitimacy. You may be asked to:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-400">
              <li>Provide social media links</li>
              <li>Show proof of impact</li>
              <li>Verify your identity</li>
              <li>Share regular updates</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
