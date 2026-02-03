"use client"

import { useState } from "react"
import { X, Flag } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onSubmit: (reason: string, customReason?: string) => void
}

export function ReportModal({ isOpen, onClose, projectName, onSubmit }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [issueDescription, setIssueDescription] = useState("")

  const reportReasons = [
    "Fake profile",
    "Report issue",
    "I don't think they need donations",
    "Spam or misleading content",
    "Inappropriate content",
    "Duplicate project",
    "Other",
  ]

  const handleSubmit = () => {
    if (selectedReason) {
      let finalReason = selectedReason
      if (selectedReason === "Report issue" && issueDescription.trim()) {
        finalReason += `: ${issueDescription.trim()}`
      } else if (selectedReason === "Other" && customReason.trim()) {
        finalReason = customReason.trim()
      }

      onSubmit(finalReason)
      onClose()
      setSelectedReason("")
      setCustomReason("")
      setIssueDescription("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2732] rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-red-400" />
            <h3 className="text-xl font-bold">Report Project</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Reporting:</p>
          <p className="text-white font-semibold truncate">{projectName}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">Why are you reporting this project?</p>

          <div className="space-y-3">
            {reportReasons.map((reason) => (
              <label key={reason} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3 text-red-400 focus:ring-red-400"
                />
                <span className="text-gray-300">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Report issue" && (
            <div className="mt-4">
              <label className="block text-sm text-gray-300 mb-2">Please describe the issue:</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the specific issue you've encountered..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
                rows={3}
              />
            </div>
          )}

          {selectedReason === "Other" && (
            <div className="mt-4">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe your reason..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:border-red-400 focus:outline-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedReason ||
              (selectedReason === "Other" && !customReason.trim()) ||
              (selectedReason === "Report issue" && !issueDescription.trim())
            }
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Submit Report
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Reports are reviewed by our moderation team. False reports may result in account restrictions.
        </p>
      </div>
    </div>
  )
}
