import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui"
import { Button } from "@repo/ui"
import { Input } from "@repo/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui"
import { ScrollArea } from "@repo/ui"
import { DashboardPreset } from "./dashboard-store"
import { cn } from "@repo/ui"
import { Check, Layout, Plus } from "lucide-react"



interface SavePresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, presetId?: string) => void
  existingPresets: DashboardPreset[]
}

export function SavePresetDialog({
  open,
  onOpenChange,
  onSave,
  existingPresets,
}: SavePresetDialogProps) {
  const [name, setName] = useState("")
  const [selectedPresetId, setSelectedPresetId] = useState<string>("")
  const [mode, setMode] = useState<"new" | "existing">("new")

  const handleSave = () => {
    if (mode === "new" && name.trim()) {
      onSave(name.trim())
      resetForm()
    } else if (mode === "existing" && selectedPresetId) {
      const preset = existingPresets.find((p) => p.id === selectedPresetId)
      if (preset) {
        onSave(preset.name, selectedPresetId)
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setName("")
    setSelectedPresetId("")
    setMode("new")
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Save Dashboard Layout</DialogTitle>
          <DialogDescription>
            Save your current dashboard layout as a new preset or update an
            existing one.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="new"
          value={mode}
          onValueChange={(value) => {
            setMode(value as "new" | "existing")
            setName("")
            setSelectedPresetId("")
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Preset
            </TabsTrigger>
            <TabsTrigger
              value="existing"
              className="flex items-center gap-2"
              disabled={existingPresets.length === 0}
            >
              <Layout className="h-4 w-4" />
              Update Existing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Create New Preset</CardTitle>
                <CardDescription>
                  Give your preset a memorable name to help you find it later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter preset name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave()
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="existing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Select Preset to Update</CardTitle>
                <CardDescription>
                  Choose an existing preset to update with your current layout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {existingPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer",
                          selectedPresetId === preset.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => setSelectedPresetId(preset.id)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{preset.name}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Created: {formatDate(preset.createdAt)}</p>
                            <p>Last updated: {formatDate(preset.updatedAt)}</p>
                          </div>
                        </div>
                        {selectedPresetId === preset.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              (mode === "new" && !name.trim()) ||
              (mode === "existing" && !selectedPresetId)
            }
          >
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
