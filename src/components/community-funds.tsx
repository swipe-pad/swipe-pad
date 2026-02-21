"use client"
import { Users } from "lucide-react"

interface CommunityFundsProps {
  onDonate: (project: any, amount?: number) => void
}

export function CommunityFunds({ onDonate }: CommunityFundsProps) {
  // Mock community funds
  const communityFunds = [
    {
      id: "fund-1",
      name: "Ocean Cleanup Fund",
      description: "Supporting projects focused on cleaning our oceans",
      category: "Climate Action",
      imageUrl: "/ocean-cleanup-effort.png",
      goal: 5000,
      current: 3200,
    },
    {
      id: "fund-2",
      name: "Education for All",
      description: "Providing educational resources to underserved communities",
      category: "Education",
      imageUrl: "/diverse-students-learning.png",
      goal: 10000,
      current: 4500,
    },
    {
      id: "fund-3",
      name: "Wildlife Protection",
      description: "Supporting animal rescue and conservation efforts",
      category: "Animal Rescue",
      imageUrl: "/diverse-wildlife.png",
      goal: 7500,
      current: 5200,
    },
  ]

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold">
          <Users className="mr-2 size-5 text-[#FFD600]" /> Community Funds
        </h2>
      </div>

      <div className="space-y-4">
        {communityFunds.map((fund) => (
          <div key={fund.id} className="rounded-lg bg-gray-900 p-4">
            <div className="mb-3 flex items-center">
              <img
                src={fund.imageUrl || "/placeholder.svg"}
                alt={fund.name}
                className="mr-3 size-12 rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{fund.name}</h3>
                <span className="text-xs text-gray-400">{fund.category}</span>
              </div>
            </div>

            <p className="mb-3 text-sm text-gray-300">{fund.description}</p>

            <div className="mb-3">
              <div className="mb-1 flex justify-between text-xs">
                <span>Progress</span>
                <span>
                  ${fund.current.toLocaleString()} of ${fund.goal.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800">
                <div
                  className="h-2 rounded-full bg-[#5454F3]"
                  style={{ width: `${Math.min(100, (fund.current / fund.goal) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() =>
                  onDonate(
                    {
                      ...fund,
                      walletAddress: "0x1234567890123456789012345678901234567890",
                    },
                    5,
                  )
                }
                className="
                  flex-1 rounded-lg bg-[#677FEB] py-2 text-sm font-medium
                  text-white transition-colors
                  hover:bg-[#5A6FD3]
                "
              >
                Support with 5 cUSD
              </button>
              <button
                onClick={() =>
                  onDonate(
                    {
                      ...fund,
                      walletAddress: "0x1234567890123456789012345678901234567890",
                    },
                    20,
                  )
                }
                className="
                  flex-1 rounded-lg bg-[#677FEB] py-2 text-sm font-medium
                  text-white transition-colors
                  hover:bg-[#5A6FD3]
                "
              >
                Support with 20 cUSD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
