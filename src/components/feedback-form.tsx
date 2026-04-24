'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface FeedbackFormProps {
  userId?: Id<'waitlistUsers'>
  context?: 'post_donation' | 'general' | 'bug'
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Beta feedback form for collecting user input
 */
export function FeedbackForm({
  userId,
  context = 'general',
  onClose,
  onSuccess,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submitFeedback = useMutation(api.waitlist.submitFeedback)

  const handleSubmit = async () => {
    if (rating === 0 || !text.trim()) return

    setIsSubmitting(true)

    try {
      if (userId) {
        await submitFeedback({
          userId,
          rating,
          text: text.trim(),
          context,
        })
      } else {
        console.log('[DEV] Feedback submitted:', { rating, text, context })
      }

      setSubmitted(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="
        fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
      ">
        <div className="w-full max-w-sm rounded-xl bg-[#1F2732] p-6 text-center">
          <span className="mb-4 block text-4xl">🎉</span>
          <h3 className="mb-2 text-lg font-bold">Thank you!</h3>
          <p className="text-sm text-gray-400">
            Your feedback helps us improve SwipePad.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
    ">
      <div className="w-full max-w-sm rounded-xl bg-[#1F2732] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {context === 'post_donation' ? 'How was your experience?' : 'Send Feedback'}
          </h3>
          <button
            onClick={onClose}
            className="
              text-gray-400 transition-colors
              hover:text-white
            "
          >
            ✕
          </button>
        </div>

        {/* Star Rating */}
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`
                text-2xl transition-transform
                hover:scale-110
                ${
                star <= rating ? 'text-yellow-400' : 'text-gray-600'
              }
              `}
            >
              ★
            </button>
          ))}
        </div>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            context === 'bug'
              ? 'Describe the bug...'
              : 'Tell us what you think...'
          }
          className="
            h-24 w-full resize-none rounded-lg border border-gray-700
            bg-[#161B22] p-3 text-sm
            placeholder:text-gray-500
            focus:border-[#677FEB] focus:outline-none
          "
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || !text.trim() || isSubmitting}
          className={`
            mt-4 w-full rounded-lg py-2.5 font-medium transition-colors
            ${
            rating > 0 && text.trim() && !isSubmitting
              ? `
                bg-[#677FEB] text-white
                hover:bg-[#5A6FD3]
              `
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }
          `}
        >
          {isSubmitting ? 'Sending...' : 'Submit Feedback'}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          🧪 Beta feedback helps shape the final product
        </p>
      </div>
    </div>
  )
}
