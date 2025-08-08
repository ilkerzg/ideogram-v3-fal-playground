"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Download01Icon, 
  Image01Icon,
  User02Icon,
  SparklesIcon,
  ArrowRight01Icon,
  GitCompareIcon
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
 

interface ResultDisplayProps {
  originalImage: string
  resultImage: string
  characterReference: string
}

export default function ResultDisplay({
  originalImage,
  resultImage,
  characterReference
}: ResultDisplayProps) {
  const [viewMode, setViewMode] = useState<"result" | "compare" | "all">("result")

  const handleDownload = async () => {
    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `face-swap-result-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success("Image downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download image")
    }
  }

  

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="result" className="gap-2">
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
              Result Only
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <HugeiconsIcon icon={GitCompareIcon} className="h-4 w-4" />
              Before & After
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" />
              All Images
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleDownload} className="gap-2 ">
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
            Download Result
          </Button>
        </div>

        <TabsContent value="result" className="mt-0">
          <Card className="p-4 bg-zinc-900 border-zinc-800">
            <div className="relative rounded-lg overflow-hidden w-full aspect-[3/4] md:aspect-[16/9] min-h-[240px]">
              <img
                src={resultImage}
                alt="Face swap result"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
              <Badge className="absolute top-4 right-4 bg-green-500/90 text-white">
                <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-4 bg-zinc-900 border-zinc-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Original Template</h3>
                  <Badge variant="secondary">Before</Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden w-full aspect-[3/4] md:aspect-[16/9] min-h-[200px]">
                  <img
                    src={originalImage}
                    alt="Original template"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-zinc-900 border-zinc-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Face Swapped</h3>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    After
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden w-full aspect-[3/4] md:aspect-[16/9] min-h-[200px]">
                  <img
                    src={resultImage}
                    alt="Face swap result"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Comparison Arrow */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Template</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-6 w-6 text-blue-500" />
              <span className="text-gray-400">+ Character Reference</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-6 w-6 text-purple-500 mx-4" />
              <span className="text-white font-medium">AI Result</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 bg-zinc-950 p-2 rounded-lg">
            {/* Character Reference */}
            <Card className="p-4 bg-zinc-900 border-zinc-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Character Reference</h3>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <HugeiconsIcon icon={User02Icon} className="h-3 w-3 mr-1" />
                    Source
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden aspect-square">
                  <img
                    src={characterReference}
                    alt="Character reference"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </Card>

            {/* Original Template */}
            <Card className="p-4 bg-zinc-900 border-zinc-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Template</h3>
                  <Badge variant="secondary">
                    <HugeiconsIcon icon={Image01Icon} className="h-3 w-3 mr-1" />
                    Base
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden aspect-square">
                  <img
                    src={originalImage}
                    alt="Original template"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </Card>

            {/* Result */}
            <Card className="p-4 bg-zinc-900 border-zinc-800 ring-2 ring-purple-500/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-400">Final Result</h3>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <HugeiconsIcon icon={SparklesIcon} className="h-3 w-3 mr-1" />
                    Result
                  </Badge>
                </div>
                <div className="relative rounded-lg overflow-hidden aspect-square">
                  <img
                    src={resultImage}
                    alt="Face swap result"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Process Flow */}
          <Card className="mt-6 p-4 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <HugeiconsIcon icon={User02Icon} className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-400">Character</span>
              </div>
              <span className="text-gray-500">+</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/20">
                <HugeiconsIcon icon={Image01Icon} className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Template</span>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-purple-500" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-purple-400 font-medium">AI Face Swap</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
