"use client"

import type React from "react"

import { useState } from "react"
import { X, ExternalLink } from "lucide-react"

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2732] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-[#1F2732] p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Project Registration</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Project Name *</label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => handleInputChange("projectName", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          {/* Representative Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name of Representative *</label>
            <input
              type="text"
              required
              value={formData.representativeName}
              onChange={(e) => handleInputChange("representativeName", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="Enter representative name"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
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
            <label className="block text-sm font-medium mb-2">Twitter of Project</label>
            <input
              type="url"
              value={formData.twitterProject}
              onChange={(e) => handleInputChange("twitterProject", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="https://twitter.com/yourproject"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="Describe your project"
              rows={4}
            />
          </div>

          {/* Team Twitter Accounts */}
          <div>
            <label className="block text-sm font-medium mb-2">Twitter accounts from Team of project</label>
            <textarea
              value={formData.teamTwitterAccounts}
              onChange={(e) => handleInputChange("teamTwitterAccounts", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="@teammember1, @teammember2, etc."
              rows={2}
            />
          </div>

          {/* Representative Contact */}
          <div>
            <label className="block text-sm font-medium mb-2">Telegram or WhatsApp of Representative</label>
            <input
              type="text"
              value={formData.representativeContact}
              onChange={(e) => handleInputChange("representativeContact", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="@username or phone number"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium mb-2">Zora, Lens, Farcaster</label>
            <div className="space-y-2">
              {formData.socialLinks.map((link, index) => (
                <input
                  key={index}
                  type="url"
                  value={link}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
                  placeholder="https://"
                />
              ))}
            </div>
          </div>

          {/* Identity Check */}
          <div>
            <label className="block text-sm font-medium mb-2">Identity Check</label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg py-2 px-3">
              <a
                href="https://self.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFD600] hover:text-[#E6C200] flex items-center"
              >
                Self Protocol <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <label className="block text-sm font-medium mb-2">Community</label>
            <select
              value={formData.community}
              onChange={(e) => handleInputChange("community", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
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
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none mt-2"
              placeholder="Or type your community"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
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
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="https://yourproject.com"
            />
          </div>

          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Wallet Type *</label>
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
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none mt-2"
              placeholder="0x... or yourname.eth"
            />
          </div>

          {/* Previous Work */}
          <div>
            <label className="block text-sm font-medium mb-2">Your previous Work: videos or pictures</label>
            <textarea
              value={formData.previousWork}
              onChange={(e) => handleInputChange("previousWork", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="Links to videos, images, or descriptions of previous work"
              rows={3}
            />
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium mb-2">Discord</label>
            <input
              type="text"
              value={formData.discord}
              onChange={(e) => handleInputChange("discord", e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#FFD600] focus:outline-none"
              placeholder="username#1234 or discord server link"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#FFD600] hover:bg-[#E6C200] text-black font-medium rounded-lg transition-colors"
            >
              Submit Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
