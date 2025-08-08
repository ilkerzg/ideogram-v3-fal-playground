/**
 * React Hooks for FAL AI Client
 * Type-safe, secure, and easy to use hooks for face swap operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  performFaceSwap, 
  performInpaintFaceSwap, 
  uploadToFal, 
  generateImage,
  isFalConfigured,
  FaceSwapResult,
  FaceSwapInput,
  InpaintInput,
  FaceSwapModel,
  ImageModel
} from '@/lib/fal-client';

/**
 * Hook Status Types
 */
export type HookStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Base Hook State
 */
export interface BaseHookState<T = any> {
  data: T | null;
  status: HookStatus;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  progress: number; // 0-100
}

/**
 * Face Swap Hook Options
 */
export interface UseFaceSwapOptions extends Partial<FaceSwapInput> {
  onSuccess?: (result: FaceSwapResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  autoUpload?: boolean; // Auto upload base64 images
  model?: FaceSwapModel;
}

/**
 * Inpaint Hook Options
 */
export interface UseInpaintOptions extends Partial<InpaintInput> {
  onSuccess?: (result: FaceSwapResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  autoUpload?: boolean;
}

/**
 * Image Generation Hook Options
 */
export interface UseGenerateImageOptions {
  model?: ImageModel;
  onSuccess?: (result: FaceSwapResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

/**
 * Create initial state
 */
function createInitialState<T>(): BaseHookState<T> {
  return {
    data: null,
    status: 'idle',
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    progress: 0,
  };
}

/**
 * Main Face Swap Hook
 * @example
 * const { swap, data, isLoading, error } = useFaceSwap({
 *   similarity_boost: 0.8,
 *   onSuccess: (result) => console.log('Success!', result)
 * });
 * 
 * // Usage
 * await swap(characterRef, templateImage);
 */
export function useFaceSwap(options: UseFaceSwapOptions = {}) {
  const [state, setState] = useState<BaseHookState<FaceSwapResult>>(createInitialState());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check if FAL is configured
  const isConfigured = isFalConfigured();

  const swap = useCallback(async (
    characterReference: string | File | Blob,
    templateImage: string | File | Blob
  ) => {
    if (!isConfigured) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'FAL API key not configured. Please add NEXT_PUBLIC_FAL_KEY to your environment variables.',
        isError: true,
      }));
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      isError: false,
      error: null,
      progress: 10,
    }));

    try {
      let sourceUrl = characterReference as string;
      let targetUrl = templateImage as string;

      // Auto upload if enabled and needed
      if (options.autoUpload !== false) {
        if (characterReference instanceof File || 
            characterReference instanceof Blob || 
            (typeof characterReference === 'string' && characterReference.startsWith('data:'))) {
          setState(prev => ({ ...prev, progress: 20 }));
          sourceUrl = await uploadToFal(characterReference);
        }

        if (templateImage instanceof File || 
            templateImage instanceof Blob || 
            (typeof templateImage === 'string' && templateImage.startsWith('data:'))) {
          setState(prev => ({ ...prev, progress: 30 }));
          targetUrl = await uploadToFal(templateImage);
        }
      }

      setState(prev => ({ ...prev, progress: 50 }));

      // Perform face swap
      const result = await performFaceSwap(sourceUrl, targetUrl, {
        similarity_boost: options.similarity_boost,
        face_enhance: options.face_enhance,
        face_restore: options.face_restore,
      });

      setState({
        data: result,
        status: 'success',
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        progress: 100,
      });

      // Call success callback
      options.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState({
        data: null,
        status: 'error',
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
        isError: true,
        progress: 0,
      });

      // Call error callback
      options.onError?.(error as Error);
      
      throw error;
    }
  }, [isConfigured, options]);

  const reset = useCallback(() => {
    setState(createInitialState());
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    swap,
    reset,
    ...state,
  };
}

/**
 * Inpaint Face Swap Hook
 * @example
 * const { inpaint, data, isLoading } = useInpaintFaceSwap({
 *   prompt: "professional portrait",
 *   strength: 0.85
 * });
 * 
 * await inpaint(templateImage, maskData, characterRef);
 */
export function useInpaintFaceSwap(options: UseInpaintOptions = {}) {
  const [state, setState] = useState<BaseHookState<FaceSwapResult>>(createInitialState());
  const abortControllerRef = useRef<AbortController | null>(null);

  const isConfigured = isFalConfigured();

  const inpaint = useCallback(async (
    templateImage: string | File | Blob,
    maskData: string | File | Blob,
    characterReference: string | File | Blob
  ) => {
    if (!isConfigured) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'FAL API key not configured',
        isError: true,
      }));
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      isError: false,
      error: null,
      progress: 10,
    }));

    try {
      let targetUrl = templateImage as string;
      let maskUrl = maskData as string;
      let sourceUrl = characterReference as string;

      // Auto upload if enabled
      if (options.autoUpload !== false) {
        if (templateImage instanceof File || 
            templateImage instanceof Blob || 
            (typeof templateImage === 'string' && templateImage.startsWith('data:'))) {
          setState(prev => ({ ...prev, progress: 20 }));
          targetUrl = await uploadToFal(templateImage);
        }

        if (maskData instanceof File || 
            maskData instanceof Blob || 
            (typeof maskData === 'string' && maskData.startsWith('data:'))) {
          setState(prev => ({ ...prev, progress: 30 }));
          maskUrl = await uploadToFal(maskData);
        }

        if (characterReference instanceof File || 
            characterReference instanceof Blob || 
            (typeof characterReference === 'string' && characterReference.startsWith('data:'))) {
          setState(prev => ({ ...prev, progress: 40 }));
          sourceUrl = await uploadToFal(characterReference);
        }
      }

      setState(prev => ({ ...prev, progress: 60 }));

      // Perform inpaint with face swap
      const result = await performInpaintFaceSwap(targetUrl, maskUrl, sourceUrl, {
        prompt: options.prompt,
        negative_prompt: options.negative_prompt,
        strength: options.strength,
        guidance_scale: options.guidance_scale,
        num_inference_steps: options.num_inference_steps,
      });

      setState({
        data: result,
        status: 'success',
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        progress: 100,
      });

      options.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState({
        data: null,
        status: 'error',
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
        isError: true,
        progress: 0,
      });

      options.onError?.(error as Error);
      
      throw error;
    }
  }, [isConfigured, options]);

  const reset = useCallback(() => {
    setState(createInitialState());
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    inpaint,
    reset,
    ...state,
  };
}

/**
 * Image Generation Hook
 * @example
 * const { generate, data, isLoading } = useGenerateImage({
 *   model: ImageModel.FLUX_DEV
 * });
 * 
 * await generate("professional business portrait");
 */
export function useGenerateImage(options: UseGenerateImageOptions = {}) {
  const [state, setState] = useState<BaseHookState<FaceSwapResult>>(createInitialState());
  const abortControllerRef = useRef<AbortController | null>(null);

  const isConfigured = isFalConfigured();

  const generate = useCallback(async (prompt: string, additionalOptions?: any) => {
    if (!isConfigured) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'FAL API key not configured',
        isError: true,
      }));
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      isError: false,
      error: null,
      progress: 20,
    }));

    try {
      setState(prev => ({ ...prev, progress: 50 }));

      const result = await generateImage(
        prompt,
        options.model || ImageModel.IDEOGRAM_CHARACTER_EDIT,
        additionalOptions
      );

      setState({
        data: result,
        status: 'success',
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        progress: 100,
      });

      options.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState({
        data: null,
        status: 'error',
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
        isError: true,
        progress: 0,
      });

      options.onError?.(error as Error);
      
      throw error;
    }
  }, [isConfigured, options]);

  const reset = useCallback(() => {
    setState(createInitialState());
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    generate,
    reset,
    ...state,
  };
}

/**
 * Upload Hook for FAL Storage
 * @example
 * const { upload, data, isLoading } = useUploadToFal();
 * const url = await upload(file);
 */
export function useUploadToFal() {
  const [state, setState] = useState<BaseHookState<string>>(createInitialState());

  const upload = useCallback(async (file: File | Blob | string) => {
    setState(prev => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      isError: false,
      error: null,
      progress: 30,
    }));

    try {
      setState(prev => ({ ...prev, progress: 60 }));
      const url = await uploadToFal(file);

      setState({
        data: url,
        status: 'success',
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
        progress: 100,
      });

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState({
        data: null,
        status: 'error',
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
        isError: true,
        progress: 0,
      });

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    upload,
    reset,
    ...state,
  };
}

/**
 * Check if FAL is configured
 */
export function useFalConfig() {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isFalConfigured());
  }, []);

  return { isConfigured };
}
