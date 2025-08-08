"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertBox } from "@/components/ui/alert-box"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Upload01Icon, 
  Image01Icon, 
  PaintBrush01Icon,
  SparklesIcon,
  User02Icon,
  Download01Icon,
  RefreshIcon,
  Search01Icon,
  Search02Icon,
  Eraser01Icon,
  Undo02Icon
} from "@hugeicons/core-free-icons"
import { Key } from "lucide-react"
import ImageUpload from "@/components/face-swap/image-upload"
import TemplateGallery from "@/components/face-swap/template-gallery"
import InpaintCanvas from "@/components/face-swap/inpaint-canvas"
import ResultDisplay from "@/components/face-swap/result-display"
import { ApiKeyDialog } from "@/components/face-swap/api-key-dialog"
import { AdvancedSettingsDialog, AdvancedSettings } from "@/components/face-swap/advanced-settings"
import { getAllTemplates, getCategories, searchTemplates, TemplateCategory } from "@/lib/template-manager"
import type { FalAsyncStatus, FalFinalResponse } from "@/lib/types"
import { uploadToFal, editCharacterConsistent, configureFal, getCurrentApiKey } from "@/lib/fal-client"
import { fal } from "@fal-ai/client"
import { Settings01Icon } from "@hugeicons/core-free-icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function FaceSwapPage() {
  const [characterReference, setCharacterReference] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [maskedArea, setMaskedArea] = useState<string | null>(null)
  const [inpaintResult, setInpaintResult] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [promptText, setPromptText] = useState("natural face, professional portrait")
  const [isPromptOpen, setPromptOpen] = useState(false)
  const [isTemplateBrowserOpen, setTemplateBrowserOpen] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    num_images: 1,
    rendering_speed: "BALANCED",
    style: "AUTO",
    expand_prompt: true,
  })
  const hasSetResultRef = useRef(false)
  const latestStatusUrlRef = useRef<string | null>(null)
  const hasFetchedStatusRef = useRef(false)
  
  // Check for API key on mount
  useEffect(() => {
    const apiKey = localStorage.getItem('fal_api_key')
    if (apiKey) {
      setHasApiKey(true)
      configureFal(apiKey)
    } else if (process.env.NEXT_PUBLIC_FAL_KEY) {
      setHasApiKey(true)
    }
  }, [])

  // Get templates based on filters
  const baseTemplates = searchQuery 
    ? searchTemplates(searchQuery)
    : selectedCategory === "all" 
      ? getAllTemplates()
      : getAllTemplates().filter(t => t.category === selectedCategory)
  // Dedupe by URL to avoid reshowing the same image multiple times
  const seen = new Set<string>()
  const templates = baseTemplates.filter(t => {
    if (seen.has(t.url)) return false
    seen.add(t.url)
    return true
  })

  const handleCharacterUpload = (imageUrl: string) => {
    setCharacterReference(imageUrl)
    toast.success("Character reference uploaded successfully")
  }

  const handleTemplateSelect = (templateUrl: string) => {
    setSelectedTemplate(templateUrl)
  }


  const handleInpaint = async (maskData: string) => {
    // Store the mask data when user finishes painting
    setMaskedArea(maskData)
    toast.info("Mask saved. Click Generate to apply changes")
  }

  const handleGenerate = async () => {
    if (!characterReference || !selectedTemplate || !maskedArea) {
      toast.error("Please complete all steps: upload reference, select template, and paint mask")
      return
    }

    if (!hasApiKey) {
      setShowApiKeyDialog(true)
      toast.error("Please configure your FAL API key first")
      return
    }

    // Reset state for a fresh generation
    hasSetResultRef.current = false
    latestStatusUrlRef.current = null
    hasFetchedStatusRef.current = false
    setInpaintResult(null)
    setIsProcessing(true)
    toast.info("Starting generation...")
    
    try {
      // Helper: upload local/public assets so FAL can fetch them
      const ensureRemote = async (url: string): Promise<string> => {
        if (url.startsWith('http')) return url
        const res = await fetch(url, { cache: 'no-cache' })
        const blob = await res.blob()
        return await uploadToFal(blob)
      }
      // Upload images to FAL if they're base64
      let referenceUrl = characterReference
      let templateUrl = selectedTemplate
      let maskUrl = maskedArea
      
      // Upload reference if it's base64
      if (characterReference.startsWith('data:')) {
        toast.info("Uploading reference image...")
        referenceUrl = await uploadToFal(characterReference)
      } else if (characterReference.startsWith('/')) {
        toast.info("Uploading local reference image...")
        referenceUrl = await ensureRemote(characterReference)
      }
      
      // Upload template if it's base64
      if (selectedTemplate.startsWith('data:')) {
        toast.info("Uploading template image...")
        templateUrl = await uploadToFal(selectedTemplate)
      } else if (selectedTemplate.startsWith('/')) {
        toast.info("Uploading local template image...")
        templateUrl = await ensureRemote(selectedTemplate)
      }
      
      // Upload mask (always base64)
      if (maskedArea.startsWith('data:')) {
        toast.info("Uploading mask...")
        maskUrl = await uploadToFal(maskedArea)
      }
      
      toast.info("Calling AI model...")
      
      // Direct API call to FAL API for Ideogram Character Edit with advanced settings
      const apiKey = getCurrentApiKey()
      
      // Build color palette if needed
      let colorPalette = undefined
      if (advancedSettings.color_palette_preset) {
        colorPalette = { name: advancedSettings.color_palette_preset }
      }
      
      const result = (await fal.subscribe("fal-ai/ideogram/character/edit", {
        input: {
          reference_image_urls: [referenceUrl], // Reference image for character
          image_url: templateUrl,                // Base image to edit
          mask_url: maskUrl,                     // Mask (white=edit, black=keep)
          prompt: promptText,                    // User's prompt
          negative_prompt: advancedSettings.negative_prompt, // Negative prompt
          rendering_speed: advancedSettings.rendering_speed,
          style: advancedSettings.style,
          expand_prompt: advancedSettings.expand_prompt,
          num_images: advancedSettings.num_images,
          seed: advancedSettings.seed,
          style_codes: advancedSettings.style_codes,
          color_palette: colorPalette,
          sync_mode: false, // Always use async mode for better performance
        },
        logs: true,
        onQueueUpdate: async (update) => {
          // Persist latest status URL
          if ((update as any).status_url) {
            latestStatusUrlRef.current = (update as any).status_url as string
            // Single status fetch only once
            if (!hasFetchedStatusRef.current && latestStatusUrlRef.current && !hasSetResultRef.current) {
              hasFetchedStatusRef.current = true
              try {
                const token = getCurrentApiKey()
                const res = await fetch(latestStatusUrlRef.current, {
                  headers: token ? { Authorization: `Key ${token}` } : undefined,
                })
                if (res.ok) {
                  const statusJson: FalAsyncStatus = await res.json()
                  if (statusJson.status === "COMPLETED" && statusJson.response_url) {
                    const responseRes = await fetch(statusJson.response_url, {
                      headers: token ? { Authorization: `Key ${token}` } : undefined,
                    })
                    if (responseRes.ok) {
                      const final: FalFinalResponse = await responseRes.json()
                      let finalUrl: string | null = null
                      if (final.data?.images?.length) finalUrl = final.data.images[0].url
                      else if (final.images?.length) finalUrl = final.images[0].url
                      else if (final.image) finalUrl = typeof final.image === 'string' ? final.image : final.image.url || null
                      else if (final.output) finalUrl = typeof final.output === 'string' ? final.output : final.output.url || null
                      if (finalUrl) {
                        hasSetResultRef.current = true
                        setInpaintResult(finalUrl)
                        toast.success("Image generated successfully!")
                      }
                    }
                  } else if (statusJson.status === "FAILED") {
                    hasSetResultRef.current = true
                    toast.error(statusJson.error?.message || "Generation failed")
                  }
                }
              } catch {}
            }
          }
          if (update.status === "IN_PROGRESS") {
            toast.info("Processing your image...")
            update.logs?.map((log: any) => log.message).forEach(console.log)
          } else if (update.status === "IN_QUEUE") {
            toast.info("Request queued, please wait...")
          }

          // Poll the real-time status to get FAL-compatible response when available
          try {
            if (latestStatusUrlRef.current && !hasSetResultRef.current) {
              const token = getCurrentApiKey()
              const statusRes = await fetch(latestStatusUrlRef.current, {
                headers: token ? { Authorization: `Key ${token}` } : undefined,
              })
              if (statusRes.ok) {
                const statusJson: FalAsyncStatus = await statusRes.json()
                if (statusJson.status === "COMPLETED" && statusJson.response_url) {
                  const responseRes = await fetch(statusJson.response_url, {
                    headers: token ? { Authorization: `Key ${token}` } : undefined,
                  })
                  if (responseRes.ok) {
                    const final: FalFinalResponse = await responseRes.json()
                    // Extract image url in a robust way
                    let finalUrl: string | null = null
                    if (final.data?.images?.length) {
                      finalUrl = final.data.images[0].url
                    } else if (final.images?.length) {
                      finalUrl = final.images[0].url
                    } else if (final.image) {
                      finalUrl = typeof final.image === 'string' ? final.image : final.image.url || null
                    } else if (final.output) {
                      finalUrl = typeof final.output === 'string' ? final.output : final.output.url || null
                    }
                    if (finalUrl) {
                      hasSetResultRef.current = true
                      setInpaintResult(finalUrl)
                      toast.success("Image generated successfully!")
                    } else {
                      console.warn("No URL in final response", final)
                    }
                  }
                } else if (statusJson.status === "FAILED") {
                  hasSetResultRef.current = true
                  toast.error(statusJson.error?.message || "Generation failed")
                  setIsProcessing(false)
                }
              }
            }
          } catch (e) {
            console.warn("Status polling failed", e)
          }
        },
        ...(apiKey ? { credentials: apiKey } : {}),
      })) as unknown as FalFinalResponse
      
      console.log("API Response:", result)
      
      // Get the result image - handle different response structures
      let resultUrl = null
      
      if (result.data && result.data.images && result.data.images.length > 0) {
        resultUrl = result.data.images[0].url
      } else if (result.images && result.images.length > 0) {
        resultUrl = result.images[0].url
      } else if (result.image) {
        resultUrl = typeof result.image === 'string' ? result.image : result.image.url || null
      } else if (result.output) {
        resultUrl = typeof result.output === 'string' ? result.output : result.output.url || null
      }
      
      if (resultUrl && !hasSetResultRef.current) {
        setInpaintResult(resultUrl)
        hasSetResultRef.current = true
        toast.success("Image generated successfully!")
      } else if (!hasSetResultRef.current) {
        console.error("Unexpected response structure:", result)
        toast.error("No result generated - check console for details")
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      toast.error(error.message || "Failed to generate image")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCharacterReference(null)
    setSelectedTemplate(null)
    setInpaintResult(null)
    setMaskedArea(null)
    setPromptText("natural face, professional portrait")
    toast.info("All selections have been reset")
  }

  return (
    <div className="min-h-screen lg:h-screen bg-black flex flex-col lg:overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="px-4 py-2 sm:py-3">
          <div className="flex mb-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl mb-0 lg:text-2xl font-bold text-white">
               FaceSwapp Ideogram V3
              </h1>
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <a target="_blank" rel="noopener noreferrer" className="group relative border bg-card p-2 flex items-center rounded-xl gap-2" href="https://fal.ai">
                  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'currentColor' }} className="w-8 h-8 md:w-10 md:h-10">
                    <path fillRule="evenodd" clipRule="evenodd" d="M 36.773 6.617 C 37.583 6.617 38.232 7.276 38.31 8.082 C 39.001 15.275 44.726 21 51.919 21.691 C 52.726 21.768 53.385 22.417 53.385 23.228 L 53.385 36.772 C 53.385 37.583 52.726 38.232 51.919 38.309 C 44.726 39 39.001 44.725 38.31 51.918 C 38.232 52.724 37.583 53.383 36.773 53.383 L 23.227 53.383 C 22.417 53.383 21.768 52.724 21.69 51.918 C 20.999 44.725 15.274 39 8.081 38.309 C 7.274 38.232 6.615 37.583 6.615 36.772 L 6.615 23.228 C 6.615 22.417 7.274 21.768 8.081 21.691 C 15.274 21 20.999 15.275 21.69 8.082 C 21.768 7.276 22.417 6.617 23.227 6.617 L 36.773 6.617 Z M 16.006 29.96 C 16.006 37.741 22.307 44.049 30.08 44.049 C 37.853 44.049 44.154 37.741 44.154 29.96 C 44.154 22.179 37.853 15.871 30.08 15.871 C 22.307 15.871 16.006 22.179 16.006 29.96 Z"></path>
                  </svg>
                  <div className="hidden md:block text-xs">Powered by <br /><span className="font-bold text-xl">Fal</span></div>
                  <div className="absolute top-full right-0 mt-1 px-2 py-1 rounded bg-card border shadow text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 md:hidden">
                    Powered by <span className="font-bold">Fal</span>
                  </div>
                </a>
                <a href="https://github.com/ilkerzg/ideogram-v3-fal-playground" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" className="group border bg-card p-2 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-8 h-8 md:w-10 md:h-10">
                    <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.094 3.292 9.41 7.868 10.94.575.106.786-.25.786-.556 0-.274-.01-1.18-.016-2.142-3.2.696-3.877-1.382-3.877-1.382-.523-1.33-1.278-1.684-1.278-1.684-1.044-.713.08-.698.08-.698 1.154.081 1.762 1.186 1.762 1.186 1.027 1.76 2.693 1.252 3.348.957.104-.744.402-1.252.732-1.54-2.553-.291-5.236-1.278-5.236-5.686 0-1.256.45-2.283 1.186-3.087-.119-.29-.514-1.463.112-3.05 0 0 .967-.31 3.17 1.18.918-.255 1.903-.383 2.882-.388.979.005 1.964.133 2.882.388 2.203-1.49 3.169-1.18 3.169-1.18.627 1.587.232 2.76.114 3.05.738.804 1.185 1.83 1.185 3.087 0 4.418-2.688 5.392-5.253 5.678.414.357.78 1.06.78 2.137 0 1.543-.014 2.787-.014 3.166 0 .309.208.669.793.555C20.21 21.405 23.5 17.09 23.5 12c0-6.352-5.148-11.5-11.5-11.5Z"/>
                  </svg>
                </a>
              </div>
               {/* Status Badges - Inline */}
              <div className="hidden sm:flex gap-2">
                {characterReference && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                    <HugeiconsIcon icon={User02Icon} className="h-3 w-3 mr-1" />
                    Reference
                  </Badge>
                )}
                {selectedTemplate && (
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                    <HugeiconsIcon icon={Image01Icon} className="h-3 w-3 mr-1" />
                    Template
                  </Badge>
                )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowApiKeyDialog(true)}
                variant="outline"
                size="sm"
                className={`gap-2 ${hasApiKey ? 'border-green-800 text-green-400' : 'border-amber-800 text-amber-400'}` }
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">{hasApiKey ? 'API Key' : 'Set Key'}</span>
              </Button>
              <Button
                onClick={() => setShowAdvancedSettings(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">

        {/* Two columns: left (template + upload), right (paint) */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-4 min-h-0" style={{height: "calc(100% - 0px)"}}>
          {/* Left: Template selector stacked above Upload */}
          <div className="flex flex-col gap-4 min-h-0">
            <Card className="p-3 sm:p-4 bg-zinc-950 border-zinc-800 flex flex-col">
              <div className="flex-shrink-0 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <HugeiconsIcon icon={Image01Icon} className="h-4 w-4 text-purple-500" />
                    Select Template
                  </h2>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setTemplateBrowserOpen(true)}>
                    Browse
                  </Button>
                </div>
              </div>
              <div className="h-[96px] overflow-hidden">
                <TemplateGallery
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={handleTemplateSelect}
                />
              </div>
            </Card>

            <Card className="p-3 sm:p-4 bg-zinc-950 border-zinc-800 flex flex-col min-h-0">
              <h2 className="text-sm sm:text-base font-semibold text-white mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={User02Icon} className="h-4 w-4 text-blue-500" />
                Upload Image
              </h2>
              <div className="flex-1 min-h-0">
                <ImageUpload
                  onImageUpload={handleCharacterUpload}
                  currentImage={characterReference}
                  label="Upload your photo"
                  disabled={isProcessing}
                />
              </div>
            </Card>
          </div>

          {/* Right: Inpaint area full height */}
          <Card className="p-3 sm:p-4 bg-zinc-950 border-zinc-800 flex flex-col min-h-0">
            {selectedTemplate ? (
              <>
                <div className="flex-shrink-0 mb-1">
                  <h2 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={PaintBrush01Icon} className="h-4 w-4 text-green-500" />
                    Paint Mask & Generate
                  </h2>
              
                </div>
                                  <div className="flex-1 overflow-hidden min-h-0">
                  <InpaintCanvas
                        imageUrl={selectedTemplate}
                        onInpaint={handleInpaint}
                        isProcessing={isProcessing}
                        characterReference={characterReference}
                        onGenerate={handleGenerate}
                        onOpenPrompt={() => setPromptOpen(true)}
                      />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <AlertBox
                  title="Setup Required"
                  description="Please select a template to begin"
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Result Modal/Overlay */}
      {inpaintResult && (
        <Dialog open={!!inpaintResult} onOpenChange={(open) => { if (!open) setInpaintResult(null) }}>
          <DialogContent
            className="bg-zinc-950 border-zinc-800 w-full max-w-6xl max-h-[85vh] sm:rounded-lg p-0 overflow-hidden flex flex-col"
          >
            <DialogHeader className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
              <DialogTitle className="text-white flex items-center gap-2">
                <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
                Generated Result
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
              <ResultDisplay
                originalImage={selectedTemplate!}
                resultImage={inpaintResult}
                characterReference={characterReference!}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Prompt Dialog */}
      <Dialog open={isPromptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Describe the desired style or scene..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="default" onClick={() => setPromptOpen(false)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Browser Dialog */}
      <Dialog open={isTemplateBrowserOpen} onOpenChange={setTemplateBrowserOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Select a template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 h-[500px] overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => { handleTemplateSelect(t.url); setTemplateBrowserOpen(false) }}
                className={"text-left group"}
              >
                <div className={"relative rounded-lg overflow-hidden  h-[400px] border " + (selectedTemplate === t.url ? "border-violet-500" : "border-zinc-800") }>
                  <img src={t.url} alt={t.name} className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2">
                    <p className="text-xs text-white font-semibold truncate">{t.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog}
        onKeyConfigured={() => {
          setHasApiKey(true)
          toast.success("API key configured successfully!")
        }}
      />
      
      {/* Advanced Settings Dialog */}
      <AdvancedSettingsDialog
        open={showAdvancedSettings}
        onOpenChange={setShowAdvancedSettings}
        settings={advancedSettings}
        onSettingsChange={(newSettings) => {
          setAdvancedSettings(newSettings)
          toast.success("Settings updated successfully!")
        }}
      />
    </div>
  )
}
