"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick01Icon, Upload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface Template {
  id: string
  url: string
  name: string
  category: string
  description: string
}

interface TemplateGalleryProps {
  templates: Template[]
  selectedTemplate: string | null
  onTemplateSelect: (templateUrl: string) => void
}

export default function TemplateGallery({
  templates,
  selectedTemplate,
  onTemplateSelect
}: TemplateGalleryProps) {
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null)
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleCustomFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCustomImageUrl(result)
      onTemplateSelect(result)
    }
    reader.readAsDataURL(file)
  }

  const onCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleCustomFile(file)
  }

  const handleRemoveCustom = () => {
    const wasSelected = selectedTemplate === customImageUrl
    setCustomImageUrl(null)
    if (wasSelected) onTemplateSelect("")
  }

  const triggerChangeUpload = () => {
    hiddenFileInputRef.current?.click()
  }

  const CustomUploadCard = (
    <Card
      className={cn(
        "relative overflow-hidden transition-all border-2 group h-full w-full  box-border !p-0",
        selectedTemplate === customImageUrl ? "border-violet-500" : "border-zinc-800 hover:border-violet-500",
      )}
    >
      <div className="h-full w-full relative flex items-center justify-center">
        {!customImageUrl && (
          <input
            type="file"
            accept="image/*"
            onChange={onCustomInputChange}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          />
        )}

        <input
          ref={hiddenFileInputRef}
          type="file"
          accept="image/*"
          onChange={onCustomInputChange}
          className="hidden"
        />

        {customImageUrl ? (
          <img
            src={customImageUrl}
            alt="Your upload"
            className="w-full h-full object-cover object-center rounded"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full rounded bg-zinc-900 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
              <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4 text-zinc-400" />
            </div>
            <p className="text-[11px] text-white font-medium">Upload</p>
          </div>
        )}

        {customImageUrl && (
          <div className="absolute top-1 left-1 right-1 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={handleRemoveCustom}
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900/80 hover:bg-zinc-900 text-white border border-zinc-700/80 flex items-center gap-1"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
              Remove
            </button>
            <button
              type="button"
              onClick={triggerChangeUpload}
              className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-900/80 hover:bg-zinc-900 text-white border border-zinc-700/80"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </Card>
  )

  const TemplateCard = (template: Template) => (
    <HoverCard   openDelay={80} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Card
          key={template.id}
          onClick={() => onTemplateSelect(template.url)}
          className={cn(
            "relative cursor-pointer overflow-hidden transition-all border-2 group h-full w-full box-border !p-0",
            "hover:border-violet-500",
            selectedTemplate === template.url ? "border-violet-500" : "border-zinc-800"
          )}
        >
          <div className="h-full w-full relative overflow-hidden rounded">
            <img
              src={template.url}
              alt={template.name}
              className="w-full h-full object-cover object-center rounded"
              draggable={false}
            />
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-80 p-2">
        <div className="flex gap-2">
          <img src={template.url} alt={template.name} className="w-28 h-28 object-cover rounded" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{template.name}</p>
            <Badge className="mt-1 text-xs py-0.5 px-2" variant="secondary">{template.category}</Badge>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )

  return (
    <Carousel opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }} className="w-full overflow-hidden max-h-[120px] h-[120px]">
      <CarouselContent className="h-full items-stretch [&>*]:px-1">
        <CarouselItem className="!h-[90px] ml-4 !w-[90px] basis-[90px] sm:basis-[90px] md:basis-[90px] lg:basis-[90px] xl:basis-[90px] 2xl:basis-[90px] h-full max-w-[90px] flex">
          {CustomUploadCard}
        </CarouselItem>
        {templates.map((t) => (
          <CarouselItem key={t.id} className="!h-[90px]  basis-[90px] sm:basis-[90px] md:basis-[90px] lg:basis-[90px] xl:basis-[90px] 2xl:basis-[90px] h-full max-w-[90px] flex">
            {TemplateCard(t)}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  )
}
