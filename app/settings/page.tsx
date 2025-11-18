"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, ArrowLeft, Target } from "lucide-react"
import type { UserSettings } from "@/types"

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [yearlyGoal, setYearlyGoal] = useState<number>(24)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSettings()
    }
  }, [isLoaded, isSignedIn])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/settings")

      if (!res.ok) {
        throw new Error("Failed to load settings")
      }

      const data = await res.json()
      setSettings(data.data)
      setYearlyGoal(data.data.yearlyGoal)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (yearlyGoal < 1 || yearlyGoal > 1000) {
      toast.error("Yearly goal must be between 1 and 1000")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearlyGoal }),
      })

      if (!res.ok) {
        throw new Error("Failed to update settings")
      }

      const data = await res.json()
      setSettings(data.data)

      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookshelf
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your reading experience</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                Reading Goals
              </CardTitle>
              <CardDescription>
                Set your yearly reading goal and track your progress throughout the year.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearlyGoal">Yearly Reading Goal</Label>
                <div className="flex gap-2">
                  <Input
                    id="yearlyGoal"
                    type="number"
                    min={1}
                    max={1000}
                    value={yearlyGoal}
                    onChange={(e) => setYearlyGoal(parseInt(e.target.value) || 1)}
                    className="max-w-xs"
                  />
                  <span className="flex items-center text-muted-foreground">books per year</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  How many books do you want to read this year? This goal will be displayed on your dashboard.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving || yearlyGoal === settings?.yearlyGoal}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
