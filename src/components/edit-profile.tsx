"use client"

import type React from "react"

import { useState } from "react"
import { X, Camera, CheckCircle, LogOut } from "lucide-react"
import { useDisconnect as useThirdwebDisconnect, useActiveWallet } from "thirdweb/react"
import { useDisconnect as useWagmiDisconnect } from "wagmi"
import { useApp } from "@/context/AppContext"

interface EditProfileProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profileData: any) => void
  currentProfile: {
    name: string
    image: string
    farcaster?: string
    twitter?: string
    zora?: string
    discord?: string
    lens?: string
    ens?: string
    poaps: number
    lilNounsHeld: number
    nounsHeld: number
    paragraphs: number
    totalSwipes: number
    projectsReported: number
    totalDonated: number
  }
}

export function EditProfile({ isOpen, onClose, onSave, currentProfile }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: currentProfile.name || "MiniPay User",
    image: currentProfile.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    bio: "",
    farcaster: currentProfile.farcaster || "",
    twitter: currentProfile.twitter || "",
    zora: currentProfile.zora || "",
    discord: currentProfile.discord || "",
    lens: currentProfile.lens || "",
    ens: currentProfile.ens || "",
  })



  const [imagePreview, setImagePreview] = useState(formData.image)
  const { disconnect: disconnectThirdweb } = useThirdwebDisconnect()
  const activeWallet = useActiveWallet()
  const { disconnect: disconnectWagmi } = useWagmiDisconnect()
  const { setWalletConnected } = useApp()

  const handleLogout = () => {
    if (activeWallet) {
      disconnectThirdweb(activeWallet)
    }
    disconnectWagmi()
    setWalletConnected(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
    ">
      <div className="
        max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-[#1F2732]
        shadow-xl
      ">
        <div className="sticky top-0 border-b border-gray-700 bg-[#1F2732] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="
              text-gray-400
              hover:text-white
            ">
              <X className="size-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Profile"
                className="
                  size-24 rounded-full border-4 border-gray-600 object-cover
                "
              />
              <label className="
                absolute right-0 bottom-0 cursor-pointer rounded-full
                bg-[#FFD600] p-2 transition-colors
                hover:bg-[#E6C200]
              ">
                <Camera className="size-4 text-black" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="
                  hidden
                " />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-400">Click camera to change photo</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Enter your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-medium">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Social Profiles</h3>

            {/* Farcaster */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="mr-2 size-4 rounded-sm bg-purple-500"></span>
                Farcaster
              </label>
              <input
                type="text"
                value={formData.farcaster}
                onChange={(e) => handleInputChange("farcaster", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="@username"
              />
            </div>

            {/* Twitter */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="
                  mr-2 size-4 rounded-sm border border-gray-600 bg-black
                "></span>
                Twitter
              </label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="@username"
              />
            </div>

            {/* Zora */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="mr-2 size-4 rounded-sm bg-blue-500"></span>
                Zora
              </label>
              <input
                type="text"
                value={formData.zora}
                onChange={(e) => handleInputChange("zora", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="username"
              />
            </div>

            {/* Discord */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="mr-2 size-4 rounded-sm bg-indigo-500"></span>
                Discord
              </label>
              <input
                type="text"
                value={formData.discord}
                onChange={(e) => handleInputChange("discord", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="username"
              />
            </div>

            {/* Lens / Hey */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="mr-2 size-4 rounded-sm bg-green-500"></span>
                Lens / Hey
              </label>
              <input
                type="text"
                value={formData.lens}
                onChange={(e) => handleInputChange("lens", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="username"
              />
            </div>

            {/* ENS */}
            <div className="mb-4">
              <label className="
                mb-2 block flex items-center text-sm font-medium
              ">
                <span className="mr-2 size-4 rounded-sm bg-sky-400"></span>
                ENS
              </label>
              <input
                type="text"
                value={formData.ens}
                onChange={(e) => handleInputChange("ens", e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white
                  focus:border-[#FFD600] focus:outline-none
                "
                placeholder="username.eth"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">NFT Holdings</h3>
            <div className="space-y-3 rounded-lg bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="
                    mr-3 flex size-8 items-center justify-center rounded-sm
                    bg-red-500
                  ">
                    <span className="text-xs font-bold text-white">P</span>
                  </div>
                  <span>POAPs</span>
                </div>
                <span className="font-bold text-[#FFD600]">{currentProfile.poaps || 10} POAPs</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="
                    mr-3 flex size-8 items-center justify-center rounded-sm
                    bg-pink-500
                  ">
                    <span className="text-xs font-bold text-white">L</span>
                  </div>
                  <span>Lil Nouns</span>
                </div>
                <span className="font-bold text-[#FFD600]">{currentProfile.lilNounsHeld || 8} Lil Nouns</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="
                    mr-3 flex size-8 items-center justify-center rounded-sm
                    bg-yellow-500
                  ">
                    <span className="text-xs font-bold text-black">N</span>
                  </div>
                  <span>Nouns</span>
                </div>
                <span className="font-bold text-[#FFD600]">{currentProfile.nounsHeld || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="
                    mr-3 flex size-8 items-center justify-center rounded-sm
                    bg-orange-500
                  ">
                    <span className="text-xs font-bold text-white">¶</span>
                  </div>
                  <span>Paragraphs</span>
                </div>
                <span className="font-bold text-[#FFD600]">{currentProfile.paragraphs || 0}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                NFT holdings are automatically detected from your connected wallet
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Self ID Check</h3>
            <div className="rounded-lg bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 size-6 text-green-500" />
                  <div>
                    <p className="font-medium">Verify your identity</p>
                    <p className="text-sm text-gray-400">Gain 100 points to your profile</p>
                  </div>
                </div>
                <button className="
                  rounded-lg bg-[#FFD600] px-4 py-2 text-sm font-medium
                  text-black transition-colors
                  hover:bg-[#E6C200]
                ">
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* User Stats (Read-only) */}
          <div>
            <h3 className="mb-4 text-lg font-medium">Your Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <p className="text-xl font-bold text-[#FFD600]">{currentProfile.totalSwipes || 47}</p>
                <p className="text-xs text-gray-400">Total Swipes</p>
              </div>
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <p className="text-xl font-bold text-[#FFD600]">{currentProfile.projectsReported || 3}</p>
                <p className="text-xs text-gray-400">Reports Made</p>
              </div>
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <p className="text-xl font-bold text-[#FFD600]">${currentProfile.totalDonated || 125.75}</p>
                <p className="text-xs text-gray-400">Total Donated</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="
                flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white
                transition-colors
                hover:bg-gray-600
              "
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="
                flex-1 rounded-lg bg-[#FFD600] py-3 font-medium text-black
                transition-colors
                hover:bg-[#E6C200]
              "
            >
              Save Profile
            </button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-700 pt-2">
             <button
              onClick={handleLogout}
              className="
                flex w-full items-center justify-center space-x-2 rounded-lg
                border border-red-500/30 bg-red-500/10 py-3 font-medium
                text-red-500 transition-colors
                hover:bg-red-500/20
              "
            >
              <LogOut className="size-4" />
              <span>Log out from SwipePad</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
