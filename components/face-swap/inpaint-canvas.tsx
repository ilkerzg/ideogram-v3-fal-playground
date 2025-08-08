"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PaintBrush01Icon, 
  Eraser01Icon, 
  Undo02Icon,
  SparklesIcon,
  RefreshIcon,
  Search01Icon,
  Search02Icon,
  Tick01Icon
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface InpaintCanvasProps {
  imageUrl: string
  onInpaint: (maskData: string) => void
  isProcessing: boolean
  characterReference: string | null
  onGenerate?: () => void
  onOpenPrompt?: () => void
}

export default function InpaintCanvas({
  imageUrl,
  onInpaint,
  isProcessing,
  characterReference,
  onGenerate,
  onOpenPrompt
}: InpaintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const fxCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(40)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [history, setHistory] = useState<ImageData[]>([])
  const [zoom, setZoom] = useState(1)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const [hasMask, setHasMask] = useState(false)
  const [maskSaved, setMaskSaved] = useState(false)
  // FX animation state (for animated dashed stroke)
  const strokePointsRef = useRef<{ x: number; y: number }[]>([])
  const fxAnimRef = useRef<number | null>(null)
  const fxLastTsRef = useRef<number | null>(null)
  const fxDashOffsetRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current || !maskCanvasRef.current) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    const fxCanvas = fxCanvasRef.current
    // Add willReadFrequently hint for better performance
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true })
    const fxCtx = fxCanvas?.getContext("2d", { willReadFrequently: true })

    if (!ctx || !maskCtx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      maskCanvas.width = img.width
      maskCanvas.height = img.height
      if (fxCanvas) {
        fxCanvas.width = img.width
        fxCanvas.height = img.height
      }
      
      ctx.drawImage(img, 0, 0)
      
      // Initialize mask canvas with transparent background
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      // Initialize fx canvas
      if (fxCanvas && fxCtx) {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height)
      }
    }
    img.src = imageUrl
  }, [imageUrl])

  const getCanvasCoordinates = (pt: { clientX: number; clientY: number }) => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return null
    
    const rect = maskCanvas.getBoundingClientRect()
    const scaleX = maskCanvas.width / rect.width
    const scaleY = maskCanvas.height / rect.height
    
    return {
      x: (pt.clientX - rect.left) * scaleX,
      y: (pt.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (isProcessing) return
    const coords = getCanvasCoordinates(e)
    if (!coords) return
    
    setIsDrawing(true)
    setLastPoint(coords)
    // Initialize stroke points for FX dashed stroke
    strokePointsRef.current = [coords]
    
    const maskCanvas = maskCanvasRef.current
    if (maskCanvas) {
      const ctx = maskCanvas.getContext("2d", { willReadFrequently: true })
      if (ctx && history.length === 0) {
        const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
        setHistory([imageData])
      }
    }
    // Stop any outline animation and clear FX layer during drawing
    stopFXLoop(true)
    if (fxCanvasRef.current) {
      const fx = fxCanvasRef.current.getContext('2d', { willReadFrequently: true })
      if (fx) fx.clearRect(0, 0, fxCanvasRef.current.width, fxCanvasRef.current.height)
    }

    draw(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return
    
    const ctx = maskCanvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return
    // Append point for FX path
    strokePointsRef.current.push(coords)

    ctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out"
    // Increase visual strength of painted mask while keeping eraser fully opaque
    ctx.strokeStyle = tool === "brush" ? "rgba(147, 51, 234, 1)" : "rgba(255, 255, 255, 1)"
    ctx.fillStyle = tool === "brush" ? "rgba(147, 51, 234, 1)" : "rgba(255, 255, 255, 1)"
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    // FX rendering handled by RAF loop for smooth, animated dashed stroke

    if (lastPoint) {
      // Draw a line from last point to current point for smooth strokes
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
      
      // Fill circles at both points for better coverage
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Just draw a circle if no last point
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    
    setLastPoint(coords)
    setHasMask(true)
    setMaskSaved(false) // Reset saved state when drawing
  }

  const stopDrawing = () => {
    if (isDrawing && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d", { willReadFrequently: true })
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
        setHistory(prev => [...prev, imageData])
      }
    }
    // Stop FX animation and clear overlay after finishing the stroke
    stopFXLoop(true)
    // Show a clean outline around the painted region after stroke ends
    renderMaskOutline()
    setIsDrawing(false)
    setLastPoint(null)
    // Auto-save mask after stroke ends
    handleInpaint()
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (isProcessing) return
    const coords = getCanvasCoordinates(e)
    if (!coords) return
    
    // Update cursor position for visual feedback
    const rect = maskCanvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = (e.clientX - rect.left) / zoom
      const y = (e.clientY - rect.top) / zoom
      setCursorPosition({ x, y })
    }
    
    if (isDrawing) {
      draw(e)
    }
  }

  const handleMouseLeave = () => {
    setCursorPosition(null)
    // If currently drawing, finish the stroke (which will start the outline animation)
    if (isDrawing) {
      stopDrawing()
    }
    // Do not stop the FX overlay here; keep the outline animation running even outside the canvas
  }

  // Pointer event wrappers for mobile/touch/pen
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isProcessing) return
    e.preventDefault()
    try { (e.currentTarget as any).setPointerCapture?.(e.pointerId) } catch {}
    startDrawing(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isProcessing) return
    e.preventDefault()
    handleMouseMove(e)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    try { (e.currentTarget as any).releasePointerCapture?.(e.pointerId) } catch {}
    stopDrawing()
  }

  const handlePointerLeave = () => {
    handleMouseLeave()
  }

  const undo = () => {
    if (history.length > 1 && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d", { willReadFrequently: true })
      if (ctx) {
        const newHistory = [...history]
        newHistory.pop()
        const lastState = newHistory[newHistory.length - 1]
        ctx.putImageData(lastState, 0, 0)
        setHistory(newHistory)
        // Re-render outline for the updated mask
        renderMaskOutline()
        // Auto-save after undo
        handleInpaint()
      }
    }
  }

  const clear = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d", { willReadFrequently: true })
      if (ctx) {
      ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
      setHistory([])
      setHasMask(false)
      setMaskSaved(false)
    }
  }
    // Also clear FX canvas
    stopFXLoop(true)
  }

  // --- FX Animated Dashed Stroke Helpers ---
  const drawDashedRingPath = (
    fx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    width: number,
    tint: string,
    dashOffset: number
  ) => {
    if (points.length === 0) return
    const first = points[0]
    fx.save()
    // Clear frame
    const canvas = fx.canvas as HTMLCanvasElement
    fx.clearRect(0, 0, canvas.width, canvas.height)

    // Build path along the stroke
    const buildPath = () => {
      fx.beginPath()
      fx.moveTo(first.x, first.y)
      for (let i = 1; i < points.length; i++) {
        fx.lineTo(points[i].x, points[i].y)
      }
    }

    // If only one point (mouse down but not moved), draw a circular dashed ring there
    if (points.length === 1) {
      const radius = Math.max(2, width / 2)
      const ringThickness = Math.max(2, Math.min(8, Math.round(width * 0.12)))
      const dashA = Math.max(6, Math.round(width * 0.9))
      const dashB = Math.max(4, Math.round(width * 0.6))
      fx.lineCap = 'round'
      fx.lineJoin = 'round'
      fx.shadowColor = tint.replace('rgb', 'rgba').replace(')', ', 0.7)')
      fx.shadowBlur = 12
      fx.setLineDash([dashA, dashB])
      fx.lineDashOffset = -dashOffset
      fx.strokeStyle = tint
      fx.lineWidth = ringThickness
      fx.beginPath()
      fx.arc(first.x, first.y, radius - ringThickness / 2, 0, Math.PI * 2)
      fx.stroke()
      // White highlight
      fx.setLineDash([dashA, dashB])
      fx.lineDashOffset = -dashOffset
      fx.strokeStyle = 'rgba(255,255,255,0.5)'
      fx.lineWidth = Math.max(1, Math.round(ringThickness * 0.6))
      fx.beginPath()
      fx.arc(first.x, first.y, radius - ringThickness / 2, 0, Math.PI * 2)
      fx.stroke()
      fx.restore()
      return
    }

    // Outer tinted glow ring (screen blend via canvas style) with animated dashes
    fx.lineCap = 'round'
    fx.lineJoin = 'round'
    fx.shadowColor = tint.replace('rgb', 'rgba').replace(')', ', 0.7)')
    fx.shadowBlur = 12
    const ringThickness = Math.max(2, Math.min(8, Math.round(width * 0.12)))
    const dashA = Math.max(6, Math.round(width * 0.9))
    const dashB = Math.max(4, Math.round(width * 0.6))
    fx.setLineDash([dashA, dashB])
    fx.lineDashOffset = -dashOffset
    fx.strokeStyle = tint
    fx.lineWidth = width
    buildPath()
    fx.stroke()

    // Hollow the inside to keep only a crisp ring
    fx.globalCompositeOperation = 'destination-out'
    fx.setLineDash([])
    fx.shadowBlur = 0
    fx.lineWidth = Math.max(1, width - ringThickness * 2)
    buildPath()
    fx.stroke()

    // Add a subtle white highlight on top for contrast
    fx.globalCompositeOperation = 'source-over'
    fx.setLineDash([dashA, dashB])
    fx.lineDashOffset = -dashOffset
    fx.strokeStyle = 'rgba(255,255,255,0.5)'
    fx.lineWidth = Math.max(1, Math.round(ringThickness * 0.6))
    buildPath()
    fx.stroke()

    // End caps: emphasize start/end circles
    fx.setLineDash([10, 8])
    fx.lineWidth = 2
    fx.strokeStyle = 'rgba(255,255,255,0.4)'
    fx.beginPath()
    fx.arc(first.x, first.y, Math.max(2, width / 2 - 1), 0, Math.PI * 2)
    fx.stroke()
    const last = points[points.length - 1]
    if (last) {
      fx.beginPath()
      fx.arc(last.x, last.y, Math.max(2, width / 2 - 1), 0, Math.PI * 2)
      fx.stroke()
    }

    fx.restore()
  }

  const startFXLoop = () => {
    if (!fxCanvasRef.current || fxAnimRef.current !== null) return
    fxLastTsRef.current = null
    const loop = (ts: number) => {
      const fx = fxCanvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (!fx) {
        fxAnimRef.current = null
        return
      }
      const tint = tool === 'brush' ? 'rgb(147, 51, 234)' : 'rgb(239, 68, 68)'
      if (fxLastTsRef.current == null) fxLastTsRef.current = ts
      const dt = ts - fxLastTsRef.current
      fxLastTsRef.current = ts
      // Increase to speed up marching dashes
      fxDashOffsetRef.current += dt * 0.9
      drawDashedRingPath(fx, strokePointsRef.current, brushSize, tint, fxDashOffsetRef.current)
      fxAnimRef.current = requestAnimationFrame(loop)
    }
    fxAnimRef.current = requestAnimationFrame(loop)
  }

  const stopFXLoop = (clearAlso = false) => {
    if (fxAnimRef.current !== null) {
      cancelAnimationFrame(fxAnimRef.current)
      fxAnimRef.current = null
    }
    fxLastTsRef.current = null
    if (clearAlso && fxCanvasRef.current) {
      const fx = fxCanvasRef.current.getContext('2d', { willReadFrequently: true })
      if (fx) fx.clearRect(0, 0, fxCanvasRef.current.width, fxCanvasRef.current.height)
    }
  }

  // Build a thin outline mask (alpha-only) for the full painted area
  // and animate a marching-ants effect over it after drawing stops.
  const outlineMaskRef = useRef<HTMLCanvasElement | null>(null)
  const patternTileRef = useRef<HTMLCanvasElement | null>(null)

  const buildOutlineMask = () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return false

    const w = maskCanvas.width
    const h = maskCanvas.height

    // Prepare temp to normalize mask to solid white
    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d', { willReadFrequently: true })
    if (!tctx) return false
    tctx.clearRect(0, 0, w, h)
    tctx.globalCompositeOperation = 'source-over'
    tctx.drawImage(maskCanvas, 0, 0)
    tctx.globalCompositeOperation = 'source-in'
    tctx.fillStyle = 'white'
    tctx.fillRect(0, 0, w, h)

    // Create/resize outline mask
    if (!outlineMaskRef.current) outlineMaskRef.current = document.createElement('canvas')
    outlineMaskRef.current.width = w
    outlineMaskRef.current.height = h
    const octx = outlineMaskRef.current.getContext('2d', { willReadFrequently: true })
    if (!octx) return false

    // Build outline by blurring and subtracting interior to leave a ring
    octx.save()
    octx.clearRect(0, 0, w, h)
    octx.filter = 'blur(2px)'
    octx.globalCompositeOperation = 'source-over'
    octx.drawImage(temp, 0, 0)
    octx.filter = 'none'
    octx.globalCompositeOperation = 'destination-out'
    octx.drawImage(temp, 0, 0)
    octx.restore()

    // If the outline mask is empty (no painted region), return false
    const img = octx.getImageData(0, 0, w, h).data
    let any = false
    for (let i = 3; i < img.length; i += 4) { if (img[i] !== 0) { any = true; break } }
    return any
  }

  const getPatternTile = () => {
    if (!patternTileRef.current) {
      const tile = document.createElement('canvas')
      tile.width = 16
      tile.height = 16
      const pctx = tile.getContext('2d')!
      // Transparent background
      pctx.clearRect(0, 0, 16, 16)
      // Draw alternating vertical bars (8px on, 8px off)
      pctx.fillStyle = 'white'
      pctx.fillRect(0, 0, 8, 16)
      patternTileRef.current = tile
    }
    return patternTileRef.current
  }

  const startOutlineAnimation = () => {
    const fxCanvas = fxCanvasRef.current
    const outline = outlineMaskRef.current
    if (!fxCanvas || !outline) return

    const fx = fxCanvas.getContext('2d', { willReadFrequently: true })
    if (!fx) return

    // Stop any existing loop first
    stopFXLoop(false)

    fxLastTsRef.current = null
    const loop = (ts: number) => {
      if (!fxCanvasRef.current || !outlineMaskRef.current) { fxAnimRef.current = null; return }
      const fx2 = fxCanvasRef.current.getContext('2d', { willReadFrequently: true })
      if (!fx2) { fxAnimRef.current = null; return }

      const w = fxCanvasRef.current.width
      const h = fxCanvasRef.current.height

      if (fxLastTsRef.current == null) fxLastTsRef.current = ts
      const dt = ts - fxLastTsRef.current
      fxLastTsRef.current = ts
      fxDashOffsetRef.current = (fxDashOffsetRef.current + dt * 0.9) % 16

      // Clear frame
      fx2.clearRect(0, 0, w, h)

      // 1) Draw outline alpha into FX
      fx2.globalCompositeOperation = 'source-over'
      fx2.drawImage(outlineMaskRef.current, 0, 0)

      // 2) Fill with moving stripe pattern clipped by outline alpha
      const tile = getPatternTile()
      const pattern = fx2.createPattern(tile, 'repeat')
      if (pattern) {
        fx2.globalCompositeOperation = 'source-in'
        fx2.save()
        fx2.translate(-fxDashOffsetRef.current, 0)
        fx2.fillStyle = pattern
        fx2.fillRect(0, 0, w + 32, h)
        fx2.restore()
      }

      // 3) Tint the stripes to tool color
      fx2.globalCompositeOperation = 'source-in'
      fx2.fillStyle = tool === 'brush' ? 'rgb(147, 51, 234)' : 'rgb(239, 68, 68)'
      fx2.fillRect(0, 0, w, h)

      fxAnimRef.current = requestAnimationFrame(loop)
    }
    fxAnimRef.current = requestAnimationFrame(loop)
  }

  // Public render: rebuild outline mask and start animation (or clear if none)
  const renderMaskOutline = () => {
    const hasAny = buildOutlineMask()
    const fxCanvas = fxCanvasRef.current
    if (!fxCanvas) return
    const fx = fxCanvas.getContext('2d', { willReadFrequently: true })
    if (!fx) return

    if (!hasAny) {
      stopFXLoop(true)
      return
    }
    startOutlineAnimation()
  }

  const handleInpaint = () => {
    if (!maskCanvasRef.current || !characterReference) return
    
    // Create a new canvas for the black/white mask
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = maskCanvasRef.current.width
    tempCanvas.height = maskCanvasRef.current.height
    const tempCtx = tempCanvas.getContext('2d')
    
    if (!tempCtx) return
    
    // Fill with black background (areas to preserve)
    tempCtx.fillStyle = 'black'
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Get the mask data
    const maskCtx = maskCanvasRef.current.getContext('2d', { willReadFrequently: true })
    if (!maskCtx) return
    
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
    
    // Convert blue mask areas to white (areas to edit)
    tempCtx.fillStyle = 'white'
    for (let i = 0; i < maskImageData.data.length; i += 4) {
      // Check if pixel has any opacity (was painted)
      if (maskImageData.data[i + 3] > 0) {
        const x = (i / 4) % maskCanvasRef.current.width
        const y = Math.floor((i / 4) / maskCanvasRef.current.width)
        tempCtx.fillRect(x, y, 1, 1)
      }
    }
    
    // Convert to data URL
    const maskData = tempCanvas.toDataURL('image/png')
    onInpaint(maskData)
    setMaskSaved(true) // Mark as saved
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Compact Status + Toolbar Row */}
      <div className="flex items-center justify-between flex-shrink-0 px-1 py-1 bg-zinc-900/40 rounded-md border border-zinc-800">
        {/* Left: tool mode + undo/clear */}
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setTool("brush")}
            variant={tool === "brush" ? "default" : "ghost"}
            size="sm"
            className={cn("h-7 px-2 text-xs", tool === "brush" && "bg-blue-600 hover:bg-blue-700")}
            disabled={isProcessing}
          >
            <HugeiconsIcon icon={PaintBrush01Icon} className="h-3 w-3" />
            Paint
          </Button>
          <Button
            onClick={() => setTool("eraser")}
            variant={tool === "eraser" ? "default" : "ghost"}
            size="sm"
            className={cn("h-7 px-2 text-xs", tool === "eraser" && "bg-red-600 hover:bg-red-700")}
            disabled={isProcessing}
          >
            <HugeiconsIcon icon={Eraser01Icon} className="h-3 w-3" />
            Erase
          </Button>
          <Button onClick={undo} variant="ghost" size="sm" disabled={history.length <= 1 || isProcessing} className="h-7 w-7 p-0 text-gray-400 hover:text-white">
            <HugeiconsIcon icon={Undo02Icon} className="h-3 w-3" />
          </Button>
          <Button onClick={clear} variant="ghost" size="sm" disabled={isProcessing} className="h-7 w-7 p-0 text-gray-400 hover:text-white">
            <HugeiconsIcon icon={RefreshIcon} className="h-3 w-3" />
          </Button>
        </div>

        {/* Right: brush size + zoom */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">Size</span>
            <div className="flex items-center gap-1 bg-zinc-800 rounded px-1 py-0.5">
              <div
                className="rounded-full border border-zinc-600"
                style={{ width: Math.min(14, brushSize / 5) + 'px', height: Math.min(14, brushSize / 5) + 'px', backgroundColor: tool === 'brush' ? 'rgb(147, 51, 234)' : 'rgb(239, 68, 68)' }}
              />
              <div className="w-20">
                <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={10} max={200} step={5} className="w-full" disabled={isProcessing} />
              </div>
              <span className="text-[11px] text-white w-6 text-center">{brushSize}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 bg-zinc-800 rounded px-0.5 py-0.5">
            <Button onClick={zoomOut} variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isProcessing}>
              <HugeiconsIcon icon={Search02Icon} className="h-3 w-3" />
            </Button>
            <span className="text-[11px] text-gray-400 px-1 min-w-[2.5rem] text-center">{Math.round(zoom * 100)}%</span>
            <Button onClick={zoomIn} variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isProcessing}>
              <HugeiconsIcon icon={Search01Icon} className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Container - Flex grow to fill available space */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-auto bg-zinc-950/50 rounded-lg border border-zinc-800 backdrop-blur-sm" 
      >
        <div 
          className="relative inline-block min-w-full min-h-full"
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: "top left"
          }}
        >
          <canvas
            ref={canvasRef}
            className="block"
          />
          <canvas
            ref={maskCanvasRef}
            className="absolute inset-0 cursor-none"
            style={{ cursor: 'none', opacity: 0.5, touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
          {/* FX overlay for dashed glow edges (visual only) */}
          <canvas
            ref={fxCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: 'normal', opacity: 1, filter: 'saturate(1.05) brightness(1.08)', zIndex: 50 }}
          />
          
          {/* Circular Brush Cursor */}
          {cursorPosition && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${cursorPosition.x - (brushSize * zoom) / 2}px`,
                top: `${cursorPosition.y - (brushSize * zoom) / 2}px`,
                width: `${brushSize * zoom}px`,
                height: `${brushSize * zoom}px`,
                borderRadius: '9999px',
                clipPath: 'circle(50% at 50% 50%)',
                WebkitClipPath: 'circle(50% at 50% 50%)',
                backgroundColor: 'transparent',
                // Remove rectangular box-shadow to avoid square-looking cursor
                boxShadow: 'none',
                overflow: 'hidden'
              }}
            >
              {/* True circular ring via SVG to avoid square corners */}
              <svg
                className="absolute inset-0"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: 'none', mixBlendMode: 'overlay', filter: tool === 'brush' ? 'drop-shadow(0 0 6px rgba(147, 51, 234, 0.35))' : 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.35))' }}
              >
                                 <circle
                   cx="50"
                   cy="50"
                   r="49"
                   stroke={tool === 'brush' ? 'rgb(147, 51, 234)' : 'rgb(239, 68, 68)'}
                   strokeWidth="2"
                   fill={tool === 'brush' ? 'rgba(147, 51, 234, 0.10)' : 'rgba(239, 68, 68, 0.10)'}
                   className={isDrawing ? '' : 'brush-ring'}
                 />
                 <circle
                   cx="50"
                   cy="50"
                   r="49"
                   stroke="rgba(255,255,255,0.5)"
                   strokeWidth="1"
                   fill="none"
                   className={isDrawing ? '' : 'brush-ring-highlight'}
                 />
              </svg>
              {/* Subtle pulse ring */}
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  // Radial gradient ensures circular pulse without relying on rounded classes
                  background: tool === 'brush'
                    ? 'radial-gradient(circle at center, rgba(147, 51, 234, 0.25) 35%, rgba(147, 51, 234, 0.12) 55%, rgba(147, 51, 234, 0) 60%)'
                    : 'radial-gradient(circle at center, rgba(239, 68, 68, 0.25) 35%, rgba(239, 68, 68, 0.12) 55%, rgba(239, 68, 68, 0) 60%)',
                  clipPath: 'circle(50% at 50% 50%)',
                  WebkitClipPath: 'circle(50% at 50% 50%)',
                  mixBlendMode: 'overlay',
                  animation: 'cursorPing 1.25s ease-out infinite',
                  filter: 'blur(0.2px)'
                }}
              />
              {/* Center crosshair for precision */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: tool === "brush" ? "rgb(147, 51, 234)" : "rgb(239, 68, 68)",
                    boxShadow: "0 0 2px rgba(0, 0, 0, 0.5)"
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Helper Section */}
      <div className="flex-shrink-0 border-t border-zinc-800 pt-2">
        <div className="flex items-center justify-between gap-2">
          {/* Helper Badge */}
          <div className="flex items-center gap-2 flex-1">
            {!characterReference && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-xs">
                ⚠️ Upload reference first
              </Badge>
            )}
            {characterReference && !hasMask && (
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 text-xs">
                💡 Paint the areas to replace
              </Badge>
            )}
            {characterReference && hasMask && (
              <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
                ✓ Mask saved - ready to generate
              </Badge>
            )}
          </div>

          {/* Edit Prompt and Generate */}
          <div className="flex items-center gap-2">
            <Button onClick={onOpenPrompt} size="sm" variant="outline" className="gap-2" disabled={isProcessing}>
              Edit Prompt
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!characterReference || !hasMask || isProcessing}
              size="sm"
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold disabled:text-white"
            >
              {isProcessing ? (
                <>
                  <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
        

      </div>
    {/* Overlay pulse keyframes */}
    <style jsx global>{`
      @keyframes maskPulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.08); }
      }
      @keyframes cursorPing {
        0% { transform: scale(0.95); opacity: 0.35; }
        70% { transform: scale(1.1); opacity: 0.05; }
        100% { transform: scale(1.15); opacity: 0; }
      }
      /* Animated dashed stroke around brush cursor ring (disabled while drawing via conditional class) */
      .brush-ring {
        stroke-dasharray: 12 8;
        animation: ringDash 1.2s linear infinite;
      }
      .brush-ring-highlight {
        stroke-dasharray: 12 8;
        animation: ringDash 1.2s linear infinite;
      }
      @keyframes ringDash {
        to { stroke-dashoffset: -200; }
      }
    `}</style>
    </div>
  )
}
