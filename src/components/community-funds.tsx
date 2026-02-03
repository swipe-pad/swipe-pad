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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="w-5 h-5 text-[#FFD600] mr-2" /> Community Funds
        </h2>
      </div>

      <div className="space-y-4">
        {communityFunds.map((fund) => (
          <div key={fund.id} className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <img
                src={fund.imageUrl || "/placeholder.svg"}
                alt={fund.name}
                className="w-12 h-12 object-cover rounded-md mr-3"
              />
              <div>
                <h3 className="font-medium">{fund.name}</h3>
                <span className="text-xs text-gray-400">{fund.category}</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3">{fund.description}</p>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>
                  ${fund.current.toLocaleString()} of ${fund.goal.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-[#5454F3] h-2 rounded-full"
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
                className="flex-1 py-2 bg-[#677FEB] hover:bg-[#5A6FD3] text-white font-medium rounded-lg transition-colors text-sm"
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
                className="flex-1 py-2 bg-[#677FEB] hover:bg-[#5A6FD3] text-white font-medium rounded-lg transition-colors text-sm"
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
