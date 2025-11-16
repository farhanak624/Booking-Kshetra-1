'use client'

import { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  currentImageUrl?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'single' | 'multiple';
}

interface ImageUploadMultipleProps extends Omit<ImageUploadProps, 'onUpload' | 'currentImageUrl' | 'variant'> {
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (index: number) => void;
  currentImageUrls?: string[];
  maxFiles?: number;
  variant: 'multiple';
}

type ImageUploadCombinedProps = ImageUploadProps | ImageUploadMultipleProps;

export default function ImageUpload(props: ImageUploadCombinedProps) {
  const {
    onUpload,
    accept = 'image/*',
    maxSizeMB = 5,
    label,
    placeholder,
    className = '',
    disabled = false,
    variant = 'single'
  } = props;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImageUrl = variant === 'single' ? (props as ImageUploadProps).currentImageUrl : undefined;
  const currentImageUrls = variant === 'multiple' ? (props as ImageUploadMultipleProps).currentImageUrls || [] : [];
  const maxFiles = variant === 'multiple' ? (props as ImageUploadMultipleProps).maxFiles || 10 : 1;
  const onRemoveSingle = variant === 'single' ? (props as ImageUploadProps).onRemove : undefined;
  const onRemoveMultiple = variant === 'multiple' ? (props as ImageUploadMultipleProps).onRemove : undefined;

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Check file count for multiple variant
    if (variant === 'multiple' && fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    try {
      setUploading(true);
      if (variant === 'single') {
        await (props as ImageUploadProps).onUpload(fileArray[0]);
      } else {
        await (props as ImageUploadMultipleProps).onUpload(fileArray);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (index?: number) => {
    if (variant === 'single' && onRemoveSingle) {
      onRemoveSingle();
    } else if (variant === 'multiple' && onRemoveMultiple && index !== undefined) {
      onRemoveMultiple(index);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={variant === 'multiple'}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-3">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  {placeholder || (variant === 'multiple'
                    ? `Click to upload or drag and drop images (max ${maxFiles})`
                    : 'Click to upload or drag and drop an image'
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Images Display */}
      {variant === 'single' && currentImageUrl && (
        <div className="relative inline-block">
          <img
            src={currentImageUrl}
            alt="Current image"
            className="h-32 w-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {variant === 'multiple' && currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentImageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-24 w-full object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {!error && !uploading && (
        (variant === 'single' && currentImageUrl) ||
        (variant === 'multiple' && currentImageUrls.length > 0)
      ) && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>
            {variant === 'single'
              ? 'Image uploaded successfully'
              : `${currentImageUrls.length} images uploaded`
            }
          </span>
        </div>
      )}
    </div>
  );
}