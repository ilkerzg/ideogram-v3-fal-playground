"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  SparklesIcon,
  PaintBrush01Icon,
  Timer01Icon,
  PaintBrush02Icon
} from "@hugeicons/core-free-icons"

export interface AdvancedSettings {
  // Generation Settings
  num_images: number
  rendering_speed: "TURBO" | "BALANCED" | "QUALITY"
  style: "AUTO" | "REALISTIC" | "FICTION"
  expand_prompt: boolean
  seed?: number
  
  // Color Palette
  color_palette_preset?: "EMBER" | "FRESH" | "JUNGLE" | "MAGIC" | "MELON" | "MOSAIC" | "PASTEL" | "ULTRAMARINE"
  custom_colors?: Array<{ r: number; g: number; b: number; weight: number }>
  
  // Style Settings
  style_image_urls?: string[]
  style_codes?: string[]
  
  // Advanced
  negative_prompt?: string
}

interface AdvancedSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AdvancedSettings
  onSettingsChange: (settings: AdvancedSettings) => void
}

const DEFAULT_SETTINGS: AdvancedSettings = {
  num_images: 1,
  rendering_speed: "BALANCED",
  style: "AUTO",
  expand_prompt: true,
}

const COLOR_PRESETS = [
  { value: "EMBER", label: "Ember", colors: ["#FF6B6B", "#FF8E53", "#FFB347"] },
  { value: "FRESH", label: "Fresh", colors: ["#4ECDC4", "#44E3D3", "#95E1D3"] },
  { value: "JUNGLE", label: "Jungle", colors: ["#2ECC71", "#27AE60", "#16A085"] },
  { value: "MAGIC", label: "Magic", colors: ["#9B59B6", "#8E44AD", "#BF55EC"] },
  { value: "MELON", label: "Melon", colors: ["#FF6B9D", "#C44569", "#FFC3A0"] },
  { value: "MOSAIC", label: "Mosaic", colors: ["#F39C12", "#E67E22", "#D35400"] },
  { value: "PASTEL", label: "Pastel", colors: ["#FFD3E1", "#C9E4FF", "#FFFACD"] },
  { value: "ULTRAMARINE", label: "Ultramarine", colors: ["#3498DB", "#2980B9", "#1F618D"] },
]

export function AdvancedSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: AdvancedSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<AdvancedSettings>(settings)
  const [activeTab, setActiveTab] = useState("generation")
  
  // Sync local settings with prop when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSettings(settings)
    }
  }, [open, settings])

  const handleSave = () => {
    onSettingsChange(localSettings)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
            Advanced Settings
          </DialogTitle>
          <DialogDescription>
            Fine-tune the AI generation parameters for better results
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generation" className="gap-2">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
              Generation
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2">
              <HugeiconsIcon icon={PaintBrush01Icon} className="h-4 w-4" />
              Style
            </TabsTrigger>
            <TabsTrigger value="color" className="gap-2">
              <HugeiconsIcon icon={PaintBrush02Icon} className="h-4 w-4" />
              Colors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generation" className="space-y-4 mt-4">
            {/* Number of Images */}
            <div className="space-y-4">
              <Label className="mb-3" htmlFor="num-images">Number of Images: {localSettings.num_images}</Label>
              <Slider
                id="num-images"
                min={1}
                max={8}
                step={1}
                value={[localSettings.num_images]}
                onValueChange={(v) => setLocalSettings({ ...localSettings, num_images: v[0] })}
                className="w-full my-2"
              />
              <p className="text-xs text-gray-500">Generate multiple variations at once</p>
            </div>

            {/* Rendering Speed */}
            <div className="space-y-2">
              <Label htmlFor="rendering-speed">Rendering Speed</Label>
              <Select
                value={localSettings.rendering_speed}
                onValueChange={(v: "TURBO" | "BALANCED" | "QUALITY") => 
                  setLocalSettings({ ...localSettings, rendering_speed: v })
                }
              >
                <SelectTrigger id="rendering-speed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TURBO">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Timer01Icon} className="h-4 w-4" />
                      Turbo (Fast, lower quality)
                    </div>
                  </SelectItem>
                  <SelectItem value="BALANCED">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Timer01Icon} className="h-4 w-4" />
                      Balanced (Recommended)
                    </div>
                  </SelectItem>
                  <SelectItem value="QUALITY">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Timer01Icon} className="h-4 w-4" />
                      Quality (Slow, best quality)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expand Prompt */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expand-prompt">Magic Prompt</Label>
                <p className="text-xs text-gray-500">AI enhances your prompt for better results</p>
              </div>
              <Switch
                id="expand-prompt"
                checked={localSettings.expand_prompt}
                onCheckedChange={(checked) => 
                  setLocalSettings({ ...localSettings, expand_prompt: checked })
                }
              />
            </div>

            {/* Seed */}
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (Optional)</Label>
              <Input
                id="seed"
                type="number"
                placeholder="Random seed for reproducible results"
                value={localSettings.seed || ""}
                onChange={(e) => 
                  setLocalSettings({ 
                    ...localSettings, 
                    seed: e.target.value ? parseInt(e.target.value) : undefined 
                  })
                }
                className="bg-zinc-900 border-zinc-800"
              />
              <p className="text-xs text-gray-500">Use the same seed to reproduce results</p>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Style Type */}
            <div className="space-y-2">
              <Label htmlFor="style">Style Type</Label>
              <Select
                value={localSettings.style}
                onValueChange={(v: "AUTO" | "REALISTIC" | "FICTION") => 
                  setLocalSettings({ ...localSettings, style: v })
                }
              >
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto (AI decides)</SelectItem>
                  <SelectItem value="REALISTIC">Realistic</SelectItem>
                  <SelectItem value="FICTION">Fiction/Artistic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
              <Input
                id="negative-prompt"
                placeholder="What to avoid in the generation..."
                value={localSettings.negative_prompt || ""}
                onChange={(e) => 
                  setLocalSettings({ ...localSettings, negative_prompt: e.target.value })
                }
                className="bg-zinc-900 border-zinc-800"
              />
              <p className="text-xs text-gray-500">Describe what you don't want to see</p>
            </div>

            {/* Style Codes */}
            <div className="space-y-2">
              <Label htmlFor="style-codes">Style Codes (Optional)</Label>
              <Input
                id="style-codes"
                placeholder="8-character hex codes, comma separated"
                value={localSettings.style_codes?.join(", ") || ""}
                onChange={(e) => {
                  const codes = e.target.value
                    .split(",")
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                  setLocalSettings({ 
                    ...localSettings, 
                    style_codes: codes.length > 0 ? codes : undefined 
                  })
                }}
                className="bg-zinc-900 border-zinc-800"
              />
              <p className="text-xs text-gray-500">Advanced: Use specific style codes</p>
            </div>
          </TabsContent>

          <TabsContent value="color" className="space-y-4 mt-4">
            {/* Color Palette Preset */}
            <div className="space-y-2">
              <Label>Color Palette Preset</Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <Card
                    key={preset.value}
                    onClick={() => 
                      setLocalSettings({ 
                        ...localSettings, 
                        color_palette_preset: preset.value as any 
                      })
                    }
                    className={`p-3 cursor-pointer transition-all ${
                      localSettings.color_palette_preset === preset.value
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preset.label}</span>
                      <div className="flex gap-1">
                        {preset.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-zinc-700"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => 
                  setLocalSettings({ ...localSettings, color_palette_preset: undefined })
                }
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
