import imagekit from '../config/imagekit';

export interface ImageUploadOptions {
  folder: string;
  fileName?: string;
  useUniqueFileName?: boolean;
  transformation?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export const uploadImageToImageKit = async (
  buffer: Buffer,
  options: ImageUploadOptions
): Promise<string> => {
  // Check if ImageKit is configured
  if (!process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY === 'your-imagekit-private-key') {
    console.warn('⚠️ ImageKit not configured - skipping image upload');
    return 'https://via.placeholder.com/800x600?text=No+Image';
  }

  try {
    const uploadOptions: any = {
      file: buffer,
      fileName: options.fileName || `image_${Date.now()}`,
      folder: options.folder,
      useUniqueFileName: options.useUniqueFileName !== false,
    };

    // Add transformation if provided
    if (options.transformation) {
      const transformations = [];
      if (options.transformation.width || options.transformation.height) {
        transformations.push(`w-${options.transformation.width || 'auto'},h-${options.transformation.height || 'auto'}`);
      }
      if (options.transformation.quality) {
        transformations.push(`q-${options.transformation.quality}`);
      }
      if (transformations.length > 0) {
        uploadOptions.transformation = {
          pre: transformations.join(',')
        };
      }
    }

    const result = await imagekit.upload(uploadOptions);
    return result.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image to ImageKit');
  }
};

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  options: ImageUploadOptions
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileOptions = {
      ...options,
      fileName: options.fileName ? `${options.fileName}_${index + 1}` : undefined,
    };
    return uploadImageToImageKit(file.buffer, fileOptions);
  });

  return Promise.all(uploadPromises);
};

export const deleteImageFromImageKit = async (imageUrl: string): Promise<void> => {
  try {
    // ImageKit deleteFile requires fileId, not URL
    // We need to find the file by URL first to get its fileId
    try {
      // Extract the file path from URL
      const urlParts = imageUrl.split('/');
      const imagekitIndex = urlParts.findIndex(part => part.includes('imagekit.io'));
      if (imagekitIndex === -1) {
        console.error('Invalid ImageKit URL:', imageUrl);
        return;
      }

      // Get the file path (everything after imagekit.io/your_id/)
      const filePath = urlParts.slice(imagekitIndex + 2).join('/');
      
      // List files to find the fileId by URL
      const files = await imagekit.listFiles({
        path: filePath.split('/').slice(0, -1).join('/'), // Get folder path
        name: filePath.split('/').pop(), // Get filename
        limit: 1
      });

      if (files && files.length > 0) {
        const file = files[0];
        // Check if it's a FileObject (not FolderObject) by checking for fileId property
        if ('fileId' in file && 'url' in file) {
          if (file.url === imageUrl || ('thumbnailUrl' in file && file.thumbnailUrl === imageUrl)) {
            await imagekit.deleteFile(file.fileId);
            console.log(`✅ Successfully deleted ImageKit file: ${file.fileId}`);
          }
        }
      } else {
        // If listing fails, try to extract fileId directly from URL if it's in the format
        // This is a fallback approach
        console.warn(`Could not find file by URL for deletion: ${imageUrl}`);
      }
    } catch (listError) {
      console.error('Error finding file for deletion:', listError);
      // Try direct deletion using URL path as fileId (some ImageKit setups allow this)
      try {
        const urlPath = imageUrl.split('imagekit.io/')[1]?.split('?')[0];
        if (urlPath) {
          await imagekit.deleteFile(urlPath);
        }
      } catch (directDeleteError) {
        console.error('Error in direct deletion fallback:', directDeleteError);
      }
    }
  } catch (error) {
    console.error('Error deleting image from ImageKit:', error);
  }
};

// Predefined folder constants
export const IMAGE_FOLDERS = {
  DRIVERS: {
    LICENSES: '/drivers/licenses',
    PROFILES: '/drivers/profiles'
  },
  VEHICLES: '/vehicles',
  YOGA: {
    TEACHERS: '/yoga/teachers',
    COURSES: '/yoga/courses'
  },
  RESORTS: {
    ROOMS: '/resorts/rooms',
    ACCOMMODATIONS: '/resorts/accommodations'
  },
  ADVENTURE_SPORTS: '/adventure-sports'
} as const;

// Predefined transformation presets
export const IMAGE_TRANSFORMATIONS = {
  PROFILE_PHOTO: {
    width: 400,
    height: 400,
    quality: 90
  },
  VEHICLE_PHOTO: {
    width: 800,
    height: 600,
    quality: 85
  },
  COURSE_THUMBNAIL: {
    width: 600,
    height: 400,
    quality: 80
  },
  LICENSE_DOCUMENT: {
    width: 1200,
    height: 800,
    quality: 95
  },
  ADVENTURE_SPORTS_PHOTO: {
    width: 800,
    height: 600,
    quality: 85
  },
  ACCOMMODATION_PHOTO: {
    width: 800,
    height: 600,
    quality: 85
  }
} as const;