'use client'

import { useState, useRef } from 'react';
import { Camera, Upload, X, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface LicensePhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
  error?: string;
}

export default function LicensePhotoUpload({
  onUpload,
  onRemove,
  currentImageUrl,
  disabled = false,
  error: externalError
}: LicensePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
    stopCamera();
  };

  const startCamera = async () => {
    try {
      setError('');
      setCameraReady(false);
      setCameraActive(true); // Show camera interface immediately so user sees something
      
      // Detect if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobile ? 'environment' : 'user', // Use back camera on mobile, front on desktop
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Ensure video plays
        const playVideo = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              // Mark camera as ready when video is playing
              setCameraReady(true);
            }
          } catch (err) {
            console.error('Error playing video:', err);
            setError('Camera started but video playback failed. Please try again.');
            setCameraReady(false);
          }
        };
        
        // Try to play when metadata loads
        videoRef.current.onloadedmetadata = () => {
          playVideo();
        };
        
        // Also listen for when video starts playing
        videoRef.current.onplaying = () => {
          setCameraReady(true);
        };
        
        // If video is already loaded, play immediately
        if (videoRef.current.readyState >= 2) {
          playVideo();
        }
        
        // Fallback: ensure video plays after a short delay
        setTimeout(() => {
          if (videoRef.current && videoRef.current.paused) {
            playVideo();
          }
          // Mark as ready if stream exists even if play hasn't completed
          if (stream && stream.getVideoTracks().length > 0) {
            setCameraReady(true);
          }
        }, 500);
      }
    } catch (err: any) {
      setCameraActive(false);
      setCameraReady(false);
      const errorMessage = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Camera access denied. Please allow camera access in your browser settings.'
        : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
        ? 'No camera found. Please connect a camera device.'
        : 'Unable to access camera. Please check permissions and try again.';
      setError(errorMessage);
      console.error('Camera error:', err);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  };

  const capturePhoto = async () => {
    console.log('Capture photo clicked');
    
    if (!videoRef.current) {
      setError('Video stream not available');
      console.error('Video ref is null');
      return;
    }

    const video = videoRef.current;
    console.log('Video element:', {
      hasSrcObject: !!video.srcObject,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused
    });
    
    // Check if video is ready
    if (!video.srcObject) {
      setError('Camera stream not active');
      console.error('No srcObject on video element');
      return;
    }

    // Check if video has valid dimensions (if 0, video isn't ready yet)
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Video not ready yet. Please wait a moment and try again.');
      console.error('Video dimensions are 0');
      return;
    }

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('Canvas created:', { width, height });
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to create canvas context');
        console.error('Canvas context is null');
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);
      console.log('Image drawn to canvas');
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture photo. Please try again.');
          console.error('Blob is null');
          return;
        }

        console.log('Blob created:', blob.size, 'bytes');

        try {
          // Create file from blob
          const file = new File([blob], `license_${Date.now()}.jpg`, { type: 'image/jpeg' });
          console.log('File created:', file.name, file.size);
          
          // Stop camera after successful capture (before upload to avoid conflicts)
          stopCamera();
          
          // Upload the captured photo
          await handleFileSelect(file);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to process captured photo');
          console.error('Error processing captured photo:', err);
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
      console.error('Capture photo error:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      const file = e.dataTransfer.files[0];
      if (file) {
        await handleFileSelect(file);
      }
    }
  };

  const displayError = externalError || error;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white mb-2">
        Driver License Photo <span className="text-red-400">*</span>
      </label>
      <p className="text-xs text-gray-400 mb-4">
        Please upload a clear photo of your driving license. You can take a photo or upload from your device.
      </p>

      {currentImageUrl ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
            <img
              src={currentImageUrl}
              alt="License photo"
              className="w-full h-64 object-contain bg-gray-900"
            />
            {!disabled && onRemove && (
              <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-green-500/90 text-white rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>License uploaded</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!cameraActive ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver ? 'border-[#B23092] bg-[#B23092]/10' : 'border-gray-600 bg-white/5'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#B23092] hover:bg-white/10'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled || uploading}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                disabled={disabled || uploading}
                className="hidden"
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-[#B23092] animate-spin" />
                  <p className="text-gray-300">Uploading license photo...</p>
                </div>
              ) : (
                <div
                  onClick={() => !disabled && fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="p-4 bg-[#B23092]/20 rounded-full">
                    <Image className="w-8 h-8 text-[#B23092]" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1">Upload License Photo</p>
                    <p className="text-gray-400 text-sm">Drag & drop or click to browse</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Browse
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!disabled && !uploading) {
                          await startCamera();
                        }
                      }}
                      className="px-4 py-2 bg-[#B23092] hover:bg-[#9a2578] text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border-2 border-[#B23092] bg-black" style={{ minHeight: '400px' }}>
              {/* Always render video element when camera is active */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-[500px] object-contain"
                style={{ 
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  minHeight: '400px',
                  backgroundColor: '#000'
                }}
                onLoadedMetadata={(e) => {
                  // Ensure video plays when metadata loads
                  const video = e.currentTarget;
                  video.play().catch(err => {
                    console.error('Error playing video:', err);
                  });
                }}
              />
              {/* Loading overlay - hide when camera is ready */}
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-white text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Starting camera...</p>
                    <p className="text-xs text-gray-400 mt-1">Initializing video stream</p>
                  </div>
                </div>
              )}
              {/* Camera controls - always visible when camera is active */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 flex gap-3 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Capture button clicked');
                    capturePhoto();
                  }}
                  disabled={!cameraReady || uploading}
                  className="flex-1 px-4 py-3 bg-[#B23092] hover:bg-[#9a2578] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Capture Photo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

