"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon, Cancel01Icon, Image01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage: string | null
  label?: string
  className?: string
  disabled?: boolean
}

export default function ImageUpload({ 
  onImageUpload, 
  currentImage, 
  label = "Upload Image",
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
  }, [disabled])

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFile(file)
    }
  }, [disabled])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onImageUpload(result)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    if (disabled) return
    onImageUpload("")
  }

  if (currentImage) {
    return (
      <div className={cn("relative group", disabled && "opacity-60 pointer-events-none", className)}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          <img
            src={currentImage}
            alt="Uploaded character"
            className="w-full h-full object-cover"
            draggable={false}
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                onClick={clearImage}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-square rounded-lg border-2 border-dashed transition-colors",
        disabled ? "opacity-60 pointer-events-none" : (isDragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 bg-zinc-900/50"),
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={disabled}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <HugeiconsIcon icon={Upload01Icon} className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-white mb-1">{label}</p>
        <p className="text-xs text-gray-500">Drag & drop or click to browse</p>
        <p className="text-xs text-gray-600 mt-2">JPG, PNG, WEBP up to 10MB</p>
      </div>
    </div>
  )
}
