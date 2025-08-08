/**
 * FAL AI Client-side API Service
 * Handles face swap and image generation directly from the browser
 */

import { fal } from "@fal-ai/client";

// Store the API key globally
let currentApiKey: string | undefined = undefined;

// FAL API configuration
export const configureFal = (apiKey?: string) => {
  if (apiKey) {
    currentApiKey = apiKey;
    // Configure FAL client with the API key
    fal.config({
      credentials: apiKey
    });
  } else if (process.env.NEXT_PUBLIC_FAL_KEY) {
    currentApiKey = process.env.NEXT_PUBLIC_FAL_KEY;
    fal.config({
      credentials: process.env.NEXT_PUBLIC_FAL_KEY
    });
  }
};

// Get current API key
export const getCurrentApiKey = () => {
  return currentApiKey || localStorage.getItem('fal_api_key') || process.env.NEXT_PUBLIC_FAL_KEY;
};

// Initialize FAL on module load
if (typeof window !== 'undefined') {
  const savedKey = localStorage.getItem('fal_api_key');
  if (savedKey) {
    configureFal(savedKey);
  } else {
    configureFal();
  }
}

/**
 * Face Swap Models available on FAL
 */
export enum FaceSwapModel {
  FACE_SWAP = "fal-ai/ideogram/character/edit",

}

/**
 * Image Generation Models
 */
export enum ImageModel {
 
  IDEOGRAM_CHARACTER_EDIT = "fal-ai/ideogram/character/edit",
}

/**
 * Face Swap Input Parameters
 */
export interface FaceSwapInput {
  source_image_url: string;  // Character reference image
  target_image_url: string;  // Template image
  similarity_boost?: number;  // 0-1, how similar to keep to source
  face_enhance?: boolean;     // Enhance face quality
  face_restore?: boolean;     // Restore face details
}

/**
 * Inpaint Input Parameters
 */
export interface InpaintInput {
  image_url: string;         // Base image
  mask_url: string;          // Mask image (painted area)
  prompt?: string;           // Description of what to generate
  negative_prompt?: string;  // What to avoid
  strength?: number;         // 0-1, how much to change
  guidance_scale?: number;   // 1-20, how closely to follow prompt
  num_inference_steps?: number; // Quality vs speed tradeoff
}

/**
 * Color Palette Member
 */
export interface ColorPaletteMember {
  rgb: {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
  };
  color_weight?: number; // 0.05-1.0
}

/**
 * Color Palette
 */
export interface ColorPalette {
  name?: "EMBER" | "FRESH" | "JUNGLE" | "MAGIC" | "MELON" | "MOSAIC" | "PASTEL" | "ULTRAMARINE";
  members?: ColorPaletteMember[];
}

/**
 * Custom Image Size
 */
export interface CustomImageSize {
  width: number;  // max 14142
  height: number; // max 14142
}

/**
 * Ideogram Character Input Parameters
 */
export interface IdeogramCharacterInput {
  reference_image_urls: string[];  // Character reference images (max 10MB total)
  prompt: string;                   // Description of the scene/situation
  image_urls?: string[];            // Style reference images (optional)
  rendering_speed?: "TURBO" | "BALANCED" | "QUALITY";
  style?: "AUTO" | "REALISTIC" | "FICTION";
  expand_prompt?: boolean;
  num_images?: number;              // 1-8 images
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" | CustomImageSize;
  negative_prompt?: string;
  seed?: number;
  style_codes?: string[];           // 8-character hex codes for style
  color_palette?: ColorPalette;     // Color palette configuration
  sync_mode?: boolean;              // Wait for completion before returning
}

/**
 * Ideogram Character Edit Input Parameters
 */
export interface IdeogramCharacterEditInput extends IdeogramCharacterInput {
  image_url: string;   // Base image to edit
  mask_url: string;    // Mask indicating area to edit (white = edit, black = preserve)
}

/**
 * Ideogram Character Result
 */
export interface IdeogramCharacterResult {
  images: Array<{
    url: string;
    width?: number;
    height?: number;
    content_type?: string;
  }>;
  seed: number;
  requestId?: string;
}

/**
 * Face Swap Result
 */
export interface FaceSwapResult {
  image: {
    url: string;
    width: number;
    height: number;
    content_type: string;
  };
  seed?: number;
  timings?: {
    inference: number;
  };
}

/**
 * Perform face swap using FAL AI
 */
export async function performFaceSwap(
  characterReference: string,
  templateImage: string,
  options: Partial<FaceSwapInput> = {}
): Promise<FaceSwapResult> {
  try {
    const apiKey = getCurrentApiKey();
    
    const result = await fal.subscribe(FaceSwapModel.FACE_SWAP, {
      input: {
        source_image_url: characterReference,
        target_image_url: templateImage,
        similarity_boost: options.similarity_boost ?? 0.7,
        face_enhance: options.face_enhance ?? true,
        face_restore: options.face_restore ?? true,
        ...options,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
      },
      ...(apiKey ? { credentials: apiKey } : {}),
    });

    return result as unknown as FaceSwapResult;
  } catch (error) {
    console.error("Face swap error:", error);
    throw new Error("Failed to perform face swap. Please try again.");
  }
}

/**
 * Perform inpainting with face swap
 */
export async function performInpaintFaceSwap(
  templateImage: string,
  maskData: string,
  characterReference: string,
  options: Partial<InpaintInput> = {}
): Promise<FaceSwapResult> {
  try {
    const apiKey = getCurrentApiKey();
    
    // First, we need to convert the mask data URL to a proper URL
    // In production, you might want to upload this to a CDN first
    
    // For inpainting with face swap, we'll use a two-step process:
    // 1. Inpaint the masked area
    // 2. Swap the face in the result
    
    const inpaintResult = await fal.subscribe("fal-ai/stable-diffusion-xl-inpainting", {
      input: {
        image_url: templateImage,
        mask_url: maskData,
        prompt: options.prompt || "a person's face, high quality portrait",
        negative_prompt: options.negative_prompt || "deformed, ugly, bad anatomy",
        strength: options.strength ?? 0.85,
        guidance_scale: options.guidance_scale ?? 7.5,
        num_inference_steps: options.num_inference_steps ?? 30,
        ...options,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Inpaint queue update:", update);
      },
      ...(apiKey ? { credentials: apiKey } : {}),
    });

    // Now perform face swap on the inpainted result
    const swapResult = await performFaceSwap(
      characterReference,
      (inpaintResult as any).image.url,
      {
        similarity_boost: 0.8,
        face_enhance: true,
      }
    );

    return swapResult;
  } catch (error) {
    console.error("Inpaint face swap error:", error);
    throw new Error("Failed to perform inpaint face swap. Please try again.");
  }
}

/**
 * Upload image to FAL storage
 * Useful for converting base64 or blob to URL
 */
export async function uploadToFal(
  file: File | Blob | string
): Promise<string> {
  try {
    // Check if fal.storage is available
    if (!fal.storage || !fal.storage.upload) {
      console.warn("FAL storage not available, using direct base64/blob URL");
      // If the input is already a URL, return it
      if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
        return file;
      }
      // For development, return the data URL directly
      // In production, you'd want to upload to a CDN
      if (typeof file === 'string') {
        return file; // Return base64 URL directly
      }
      // Convert blob to data URL
      if (file instanceof Blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
    }
    
    let uploadFile: File;
    
    if (typeof file === 'string') {
      // Convert base64 to blob
      const response = await fetch(file);
      const blob = await response.blob();
      uploadFile = new File([blob], "image.png", { type: "image/png" });
    } else if (file instanceof Blob) {
      uploadFile = new File([file], "image.png", { type: file.type });
    } else {
      uploadFile = file;
    }

    const url = await fal.storage.upload(uploadFile);
    return url;
  } catch (error) {
    console.error("Upload error:", error);
    // Fallback: return the original if it's a string
    if (typeof file === 'string') {
      console.warn("Falling back to direct URL/base64");
      return file;
    }
    throw new Error("Failed to upload image");
  }
}

/**
 * Generate image with AI (for creating new templates)
 */
export async function generateImage(
  prompt: string,
  model: ImageModel = ImageModel.IDEOGRAM_CHARACTER_EDIT, 
  options: any = {}
): Promise<FaceSwapResult> {
  try {
    const apiKey = getCurrentApiKey();
    
    const result = await fal.subscribe(model, {
      input: {
        prompt,
        image_size: "square",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        ...options,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Generation queue update:", update);
      },
      ...(apiKey ? { credentials: apiKey } : {}),
    });

    return result as unknown as FaceSwapResult;
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("Failed to generate image");
  }
}

/**
 * Check if FAL API is configured
 */
export function isFalConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_FAL_KEY;
}

/**
 * Generate consistent character with Ideogram
 * Maintains facial features and traits across multiple images
 */
export async function generateCharacterConsistent(
  referenceImages: string[],
  prompt: string,
  options: Partial<IdeogramCharacterInput> = {}
): Promise<IdeogramCharacterResult> {
  try {
    // Validate reference images
    if (!referenceImages || referenceImages.length === 0) {
      throw new Error("At least one reference image is required");
    }

    // Upload local images if they're data URLs or blobs
    const uploadedRefs = await Promise.all(
      referenceImages.map(async (img) => {
        if (img.startsWith('data:') || img.startsWith('blob:')) {
          return await uploadToFal(img);
        }
        return img;
      })
    );

    // Upload style images if provided
    let uploadedStyles: string[] | undefined;
    if (options.image_urls && options.image_urls.length > 0) {
      uploadedStyles = await Promise.all(
        options.image_urls.map(async (img) => {
          if (img.startsWith('data:') || img.startsWith('blob:')) {
            return await uploadToFal(img);
          }
          return img;
        })
      );
    }

    const apiKey = getCurrentApiKey();
    
    const result = await fal.subscribe(ImageModel.IDEOGRAM_CHARACTER_EDIT, {
      input: {
        reference_image_urls: uploadedRefs,
        prompt,
        rendering_speed: options.rendering_speed || "BALANCED",
        style: options.style || "AUTO",
        expand_prompt: options.expand_prompt !== false,
        num_images: options.num_images || 1,
        image_size: options.image_size || "square_hd",
        image_urls: uploadedStyles,
        negative_prompt: options.negative_prompt || "",
        seed: options.seed,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Ideogram progress:", update.logs?.map((log: any) => log.message));
        }
      },
      ...(apiKey ? { credentials: apiKey } : {}),
    });

    return {
      images: (result as any).images || [],
      seed: (result as any).seed,
      requestId: (result as any).requestId,
    };
  } catch (error) {
    console.error("Ideogram character generation error:", error);
    throw new Error("Failed to generate consistent character. Please try again.");
  }
}

/**
 * Generate character variations with different prompts
 * Useful for creating a story or multiple scenes with the same character
 */
export async function generateCharacterStory(
  referenceImages: string[],
  prompts: string[],
  options: Partial<IdeogramCharacterInput> = {}
): Promise<IdeogramCharacterResult[]> {
  try {
    const results = await Promise.all(
      prompts.map(prompt => 
        generateCharacterConsistent(referenceImages, prompt, options)
      )
    );
    return results;
  } catch (error) {
    console.error("Character story generation error:", error);
    throw new Error("Failed to generate character story");
  }
}

/**
 * Edit an image with character consistency using Ideogram
 * Inpaints specific areas while maintaining character features
 */
export async function editCharacterConsistent(
  referenceImages: string[],
  imageUrl: string,
  maskUrl: string,
  prompt: string,
  options: Partial<IdeogramCharacterEditInput> = {}
): Promise<IdeogramCharacterResult> {
  try {
    // Validate inputs
    if (!referenceImages || referenceImages.length === 0) {
      throw new Error("At least one reference image is required");
    }
    if (!imageUrl || !maskUrl) {
      throw new Error("Both image and mask URLs are required for editing");
    }

    // Upload local images if they're data URLs or blobs
    const uploadedRefs = await Promise.all(
      referenceImages.map(async (img) => {
        if (img.startsWith('data:') || img.startsWith('blob:')) {
          return await uploadToFal(img);
        }
        return img;
      })
    );

    // Upload base image if it's a data URL
    let uploadedImage = imageUrl;
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      uploadedImage = await uploadToFal(imageUrl);
    }

    // Upload mask if it's a data URL
    let uploadedMask = maskUrl;
    if (maskUrl.startsWith('data:') || maskUrl.startsWith('blob:')) {
      uploadedMask = await uploadToFal(maskUrl);
    }

    // Upload style images if provided
    let uploadedStyles: string[] | undefined;
    if (options.image_urls && options.image_urls.length > 0) {
      uploadedStyles = await Promise.all(
        options.image_urls.map(async (img) => {
          if (img.startsWith('data:') || img.startsWith('blob:')) {
            return await uploadToFal(img);
          }
          return img;
        })
      );
    }

    const apiKey = getCurrentApiKey();
    
    const result = await fal.subscribe(ImageModel.IDEOGRAM_CHARACTER_EDIT, {
      input: {
        reference_image_urls: uploadedRefs,
        image_url: uploadedImage,
        mask_url: uploadedMask,
        prompt,
        rendering_speed: options.rendering_speed || "BALANCED",
        style: options.style || "AUTO",
        expand_prompt: options.expand_prompt !== false,
        num_images: options.num_images || 1,
        image_urls: uploadedStyles,
        negative_prompt: options.negative_prompt || "",
        seed: options.seed,
        style_codes: options.style_codes,
        color_palette: options.color_palette,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Ideogram edit progress:", update.logs?.map((log: any) => log.message));
        }
      },
      ...(apiKey ? { credentials: apiKey } : {}),
    });

    return {
      images: (result as any).images || [],
      seed: (result as any).seed,
      requestId: (result as any).requestId,
    };
  } catch (error) {
    console.error("Ideogram character edit error:", error);
    throw new Error("Failed to edit character image. Please try again.");
  }
}

/**
 * Get available models
 */
export async function getAvailableModels() {
  try {
    // This would typically fetch from FAL API
    // For now, return static list
    return {
      faceSwap: Object.values(FaceSwapModel),
      imageGeneration: Object.values(ImageModel),
      characterConsistent: [ImageModel.IDEOGRAM_CHARACTER_EDIT],
    };
  } catch (error) {
    console.error("Failed to fetch models:", error);
    return {
      faceSwap: [],
      imageGeneration: [],
      characterConsistent: [],
    };
  }
}
