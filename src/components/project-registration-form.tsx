"use client"

import type React from "react"

import { useState } from "react"
import { X, ExternalLink } from "lucide-react"
import { SafeExternalLink } from "@/components/ui/safe-external-link"

interface ProjectRegistrationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any) => void
}

export function ProjectRegistrationForm({ isOpen, onClose, onSubmit }: ProjectRegistrationFormProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    representativeName: "",
    projectType: "project", // "project" or "independent"
    twitterProject: "",
    description: "",
    teamTwitterAccounts: "",
    representativeContact: "",
    socialLinks: ["", "", "", "", ""],
    community: "",
    category: "",
    website: "",
    walletType: "wallet", // "wallet", "ens", or "multisig"
    walletAddress: "",
    previousWork: "",
    discord: "",
  })

  const categories = ["Regeneration", "Climate Action", "Social Impact", "Open Source", "Nature", "RWA"]
  const communities = ["Greenpill", "ReFiDAO", "Gitcoin", "CPG", "Regens United"]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks]
    newLinks[index] = value
    setFormData((prev) => ({ ...prev, socialLinks: newLinks }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
    ">
      <div className="
        max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[#1F2732]
        shadow-xl
      ">
        <div className="sticky top-0 border-b border-gray-700 bg-[#1F2732] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Project Registration</h2>
            <button onClick={onClose} className="
              text-gray-400
              hover:text-white
            ">
              <X className="size-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Project Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">Project Name *</label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => handleInputChange("projectName", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Enter project name"
            />
          </div>

          {/* Representative Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">Name of Representative *</label>
            <input
              type="text"
              required
              value={formData.representativeName}
              onChange={(e) => handleInputChange("representativeName", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Enter representative name"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">Type *</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectType"
                  value="project"
                  checked={formData.projectType === "project"}
                  onChange={(e) => handleInputChange("projectType", e.target.value)}
                  className="mr-2"
                />
                <span>Project</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="projectType"
                  value="independent"
                  checked={formData.projectType === "independent"}
                  onChange={(e) => handleInputChange("projectType", e.target.value)}
                  className="mr-2"
                />
                <span>Independent Initiative</span>
              </label>
            </div>
          </div>

          {/* Twitter of Project */}
          <div>
            <label className="mb-2 block text-sm font-medium">Twitter of Project</label>
            <input
              type="url"
              value={formData.twitterProject}
              onChange={(e) => handleInputChange("twitterProject", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="https://twitter.com/yourproject"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Describe your project"
              rows={4}
            />
          </div>

          {/* Team Twitter Accounts */}
          <div>
            <label className="mb-2 block text-sm font-medium">Twitter accounts from Team of project</label>
            <textarea
              value={formData.teamTwitterAccounts}
              onChange={(e) => handleInputChange("teamTwitterAccounts", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="@teammember1, @teammember2, etc."
              rows={2}
            />
          </div>

          {/* Representative Contact */}
          <div>
            <label className="mb-2 block text-sm font-medium">Telegram or WhatsApp of Representative</label>
            <input
              type="text"
              value={formData.representativeContact}
              onChange={(e) => handleInputChange("representativeContact", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="@username or phone number"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="mb-2 block text-sm font-medium">Zora, Lens, Farcaster</label>
            <div className="space-y-2">
              {formData.socialLinks.map((link, index) => (
                <input
                  key={index}
                  type="url"
                  value={link}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  className="
                    w-full rounded-lg border border-gray-600 bg-gray-800 px-3
                    py-2 text-white
                    focus:border-[#FFD600] focus:outline-none
                  "
                  placeholder="https://"
                />
              ))}
            </div>
          </div>

          {/* Identity Check */}
          <div>
            <label className="mb-2 block text-sm font-medium">Identity Check</label>
            <div className="
              rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
            ">
              <SafeExternalLink
                href="https://self.xyz"
                className="
                  flex items-center text-[#FFD600]
                  hover:text-[#E6C200]
                "
              >
                Self Protocol <ExternalLink className="ml-1 size-4" />
              </SafeExternalLink>
            </div>
          </div>

          {/* Community */}
          <div>
            <label className="mb-2 block text-sm font-medium">Community</label>
            <select
              value={formData.community}
              onChange={(e) => handleInputChange("community", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
            >
              <option value="">Select a community</option>
              {communities.map((community) => (
                <option key={community} value={community}>
                  {community}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.community.includes("Other:") ? formData.community.replace("Other:", "") : ""}
              onChange={(e) => handleInputChange("community", `Other:${e.target.value}`)}
              className="
                mt-2 w-full rounded-lg border border-gray-600 bg-gray-800 px-3
                py-2 text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Or type your community"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="mb-2 block text-sm font-medium">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="https://yourproject.com"
            />
          </div>

          {/* Wallet Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">Wallet Type *</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="walletType"
                  value="wallet"
                  checked={formData.walletType === "wallet"}
                  onChange={(e) => handleInputChange("walletType", e.target.value)}
                  className="mr-2"
                />
                <span>Wallet</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="walletType"
                  value="ens"
                  checked={formData.walletType === "ens"}
                  onChange={(e) => handleInputChange("walletType", e.target.value)}
                  className="mr-2"
                />
                <span>ENS</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="walletType"
                  value="multisig"
                  checked={formData.walletType === "multisig"}
                  onChange={(e) => handleInputChange("walletType", e.target.value)}
                  className="mr-2"
                />
                <span>Multi-Sig</span>
              </label>
            </div>
            <input
              type="text"
              required
              value={formData.walletAddress}
              onChange={(e) => handleInputChange("walletAddress", e.target.value)}
              className="
                mt-2 w-full rounded-lg border border-gray-600 bg-gray-800 px-3
                py-2 text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="0x... or yourname.eth"
            />
          </div>

          {/* Previous Work */}
          <div>
            <label className="mb-2 block text-sm font-medium">Your previous Work: videos or pictures</label>
            <textarea
              value={formData.previousWork}
              onChange={(e) => handleInputChange("previousWork", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="Links to videos, images, or descriptions of previous work"
              rows={3}
            />
          </div>

          {/* Discord */}
          <div>
            <label className="mb-2 block text-sm font-medium">Discord</label>
            <input
              type="text"
              value={formData.discord}
              onChange={(e) => handleInputChange("discord", e.target.value)}
              className="
                w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                text-white
                focus:border-[#FFD600] focus:outline-none
              "
              placeholder="username#1234 or discord server link"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
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
              type="submit"
              className="
                flex-1 rounded-lg bg-[#FFD600] py-3 font-medium text-black
                transition-colors
                hover:bg-[#E6C200]
              "
            >
              Submit Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
