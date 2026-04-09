"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"

export default function InviteCodesAdminPage() {
  const inviteCodes = useQuery(api.inviteCodes.list)
  const createInviteCode = useMutation(api.inviteCodes.create)
  const toggleActive = useMutation(api.inviteCodes.toggleActive)
  const deleteInviteCode = useMutation(api.inviteCodes.delete)

  const [newCodeLabel, setNewCodeLabel] = useState("")
  const [newCodeMaxUses, setNewCodeMaxUses] = useState("10")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newCodeLabel.trim()) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      await createInviteCode({
        label: newCodeLabel.trim(),
        maxUses: Number(newCodeMaxUses) || 10,
      })
      setNewCodeLabel("")
      setNewCodeMaxUses("10")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite code")
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggle = async (id: Id<"inviteCodes">, currentActive: boolean) => {
    try {
      await toggleActive({
        inviteCodeId: id,
        active: !currentActive,
      })
    } catch (err) {
      console.error("Failed to toggle invite code:", err)
    }
  }

  const handleDelete = async (id: Id<"inviteCodes">) => {
    if (!confirm("Are you sure you want to delete this invite code?")) return
    
    try {
      await deleteInviteCode({
        inviteCodeId: id,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete invite code")
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Invite Codes Management</h1>

      {/* Create New Code */}
      <div className="mb-8 rounded-lg border border-surface-border bg-surface-panel p-6">
        <h2 className="mb-4 text-xl font-semibold">Create New Invite Code</h2>
        <div className="flex gap-4">
          <Input
            placeholder="Label (e.g., 'Twitter Campaign')"
            value={newCodeLabel}
            onChange={(e) => setNewCodeLabel(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Max uses"
            type="number"
            value={newCodeMaxUses}
            onChange={(e) => setNewCodeMaxUses(e.target.value)}
            className="w-32"
          />
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !newCodeLabel.trim()}
            className="gap-2"
          >
            <Plus className="size-4" />
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {/* Invite Codes List */}
      <div className="rounded-lg border border-surface-border bg-surface-panel">
        <div className="border-b border-surface-border p-4">
          <h2 className="text-xl font-semibold">Active Invite Codes</h2>
        </div>

        {!inviteCodes ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : inviteCodes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No invite codes created yet.</div>
        ) : (
          <div className="divide-y divide-surface-border">
            {inviteCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="font-medium">{code.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Uses: {code.uses} / {code.maxUses} • Created: {new Date(code.createdAt).toLocaleDateString()}
                  </p>
                  {code.notes && (
                    <p className="text-sm text-muted-foreground">{code.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(code.id, code.active)}
                    title={code.active ? "Deactivate" : "Activate"}
                  >
                    {code.active ? (
                      <ToggleRight className="size-5 text-green-400" />
                    ) : (
                      <ToggleLeft className="size-5 text-gray-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(code.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
