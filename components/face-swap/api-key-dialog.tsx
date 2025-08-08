"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, AlertCircle, Check, ExternalLink } from "lucide-react"
import { configureFal } from "@/lib/fal-client"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeyConfigured?: () => void
}

export function ApiKeyDialog({ open, onOpenChange, onKeyConfigured }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasExistingKey, setHasExistingKey] = useState(false)

  useEffect(() => {
    // Reset states when dialog opens
    if (open) {
      setError("")
      setSuccess(false)
      setIsValidating(false)
      
      // Check if there's an existing key
      const existingKey = localStorage.getItem("fal_api_key")
      if (existingKey) {
        setHasExistingKey(true)
        setApiKey(existingKey)
      } else {
        setHasExistingKey(false)
        setApiKey("")
      }
    }
  }, [open])

  const validateApiKey = () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key")
      return
    }

    setIsValidating(true)
    setError("")

    // Save to localStorage
    localStorage.setItem("fal_api_key", apiKey)
    
    // Configure FAL with the new key
    configureFal(apiKey)
    
    setSuccess(true)
    
    setTimeout(() => {
      setIsValidating(false)
      onOpenChange(false)
      if (onKeyConfigured) {
        onKeyConfigured()
      }
    }, 1500)
  }

  const removeApiKey = () => {
    localStorage.removeItem("fal_api_key")
    setApiKey("")
    setHasExistingKey(false)
    setSuccess(false)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Key className="w-5 h-5 text-purple-500" />
            Configure FAL API Key
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your FAL AI API key to enable image generation features. Your key is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasExistingKey && !success && (
            <Alert className="bg-blue-950/50 border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-200">
                You have an existing API key configured. Enter a new key to replace it.
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-950/50 border-green-800">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-200">
                API key configured successfully!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-950/50 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-gray-300">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your FAL API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
              disabled={isValidating || success}
            />
            <p className="text-xs text-gray-500">
              Your API key is never sent to our servers and is stored only in your browser.
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-300">
              How to get your API key:
            </h4>
            <ol className="text-sm text-gray-400 space-y-2">
              <li className="flex gap-2">
                <span className="text-purple-500">1.</span>
                <span>
                  Visit{" "}
                  <a
                    href="https://fal.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                  >
                    fal.ai
                    <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  and sign up for an account
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">2.</span>
                <span>Go to your dashboard and navigate to API Keys</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">3.</span>
                <span>Create a new API key and copy it</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-500">4.</span>
                <span>Paste the key here and click Configure</span>
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {hasExistingKey && !success && (
            <Button
              type="button"
              variant="outline"
              onClick={removeApiKey}
              className="border-red-800 text-red-400 hover:bg-red-950/50"
              disabled={isValidating}
            >
              Remove Current Key
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
            disabled={isValidating}
          >
            Cancel
          </Button>
          <Button
            onClick={validateApiKey}
            disabled={isValidating || success || !apiKey.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Configuring...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Configured
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Configure API Key
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
