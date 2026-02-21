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
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
    ">
      <div className="w-full max-w-md rounded-xl bg-[#1F2732] p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="size-5 text-red-400" />
            <h3 className="text-xl font-bold">Report Project</h3>
          </div>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-300">Reporting:</p>
          <p className="truncate font-semibold text-white">{projectName}</p>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-sm text-gray-300">Why are you reporting this project?</p>

          <div className="space-y-3">
            {reportReasons.map((reason) => (
              <label key={reason} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="
                    mr-3 text-red-400
                    focus:ring-red-400
                  "
                />
                <span className="text-gray-300">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === "Report issue" && (
            <div className="mt-4">
              <label className="mb-2 block text-sm text-gray-300">Please describe the issue:</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Describe the specific issue you've encountered..."
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white placeholder-gray-400
                  focus:border-red-400 focus:outline-none
                "
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
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2
                  text-white placeholder-gray-400
                  focus:border-red-400 focus:outline-none
                "
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-3">
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
            onClick={handleSubmit}
            disabled={
              !selectedReason ||
              (selectedReason === "Other" && !customReason.trim()) ||
              (selectedReason === "Report issue" && !issueDescription.trim())
            }
            className="
              flex-1 rounded-lg bg-red-500 py-3 font-medium text-white
              transition-colors
              hover:bg-red-600
              disabled:cursor-not-allowed disabled:bg-gray-600
            "
          >
            Submit Report
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Reports are reviewed by our moderation team. False reports may result in account restrictions.
        </p>
      </div>
    </div>
  )
}
