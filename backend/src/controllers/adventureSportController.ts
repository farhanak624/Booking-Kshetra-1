// @ts-nocheck
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AdventureSport } from '../models';
import { uploadImageToImageKit, uploadMultipleImages, IMAGE_FOLDERS, IMAGE_TRANSFORMATIONS } from '../utils/imagekitUpload';

// Get all adventure sports (public)
export const getAdventureSports = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, minPrice, maxPrice, sortBy = 'price', sortOrder = 'asc' } = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const sports = await AdventureSport.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      data: {
        sports,
        count: sports.length
      }
    });
  } catch (error) {
    console.error('Get adventure sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get adventure sport by ID (public)
export const getAdventureSportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sport = await AdventureSport.findOne({
      _id: id,
      isActive: true
    });

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Adventure sport not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sport
    });
  } catch (error) {
    console.error('Get adventure sport by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get adventure sports by category (public)
export const getAdventureSportsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    if (!['adventure', 'surfing', 'diving', 'trekking'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be adventure, surfing, diving, or trekking'
      });
    }

    const sports = await AdventureSport.find({
      category,
      isActive: true
    }).sort({ price: 1 });

    res.status(200).json({
      success: true,
      data: {
        sports,
        count: sports.length,
        category
      }
    });
  } catch (error) {
    console.error('Get adventure sports by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create adventure sport (admin only)
export const createAdventureSport = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const sport = new AdventureSport(req.body);
    await sport.save();

    res.status(201).json({
      success: true,
      message: 'Adventure sport created successfully',
      data: sport
    });
  } catch (error) {
    console.error('Create adventure sport error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update adventure sport (admin only)
export const updateAdventureSport = async (req: Request, res: Response) => {
  try {
    console.log('\n=== UPDATE ADVENTURE SPORT DEBUG ===');
    console.log('Request Method:', req.method);
    console.log('Request Params:', req.params);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request Body Type:', typeof req.body);
    console.log('Request Body Keys:', Object.keys(req.body || {}));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    console.log('Adventure Sport ID:', id);

    // Check if sport exists before update
    const existingSport = await AdventureSport.findById(id);
    if (!existingSport) {
      console.log('ERROR: Adventure sport not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Adventure sport not found'
      });
    }
    console.log('Existing Sport Images:', existingSport.images);
    console.log('Existing Sport Data:', JSON.stringify(existingSport.toObject(), null, 2));

    // Support flexible image updates:
    // - imageUrl: string -> append single URL to images
    // - images: string[] with appendImages=true -> append many
    // - images: string[] with appendImages not set -> replace images
    const { imageUrl, images, appendImages } = req.body as any;
    console.log('Extracted Values:');
    console.log('  - imageUrl:', imageUrl);
    console.log('  - images:', images);
    console.log('  - appendImages:', appendImages);

    // Build update object
    let update: any = { ...req.body };
    delete update.imageUrl;
    delete update.appendImages;
    console.log('Update Object (before image processing):', JSON.stringify(update, null, 2));

    // Handle image updates - only update if explicitly provided
    if (imageUrl) {
      console.log('Processing single imageUrl:', imageUrl);
      update.$addToSet = { ...(update.$addToSet || {}), images: imageUrl };
      delete update.images; // avoid accidental replacement
      console.log('Using $addToSet for single image');
    } else if (Array.isArray(images)) {
      if (images.length > 0 && appendImages) {
        console.log('Processing images array with appendImages=true (appending', images.length, 'images)');
        update.$addToSet = { ...(update.$addToSet || {}), images: { $each: images } };
        delete update.images; // do not replace when appending
        console.log('Using $addToSet with $each for multiple images');
      } else if (images.length > 0 && !appendImages) {
        console.log('Processing images array to REPLACE (appendImages=false or not set,', images.length, 'images)');
        console.log('Images to set:', images);
        // Explicitly set images array - this will replace the entire array
        update.images = images;
        // Make sure we're not using $addToSet for this case
        if (update.$addToSet) {
          delete update.$addToSet.images;
        }
        console.log('Set update.images to:', update.images);
      } else if (images.length === 0) {
        console.log('WARNING: Empty images array received - PRESERVING existing images (not updating images field)');
        delete update.images; // Don't update images field if empty array - preserve existing
      }
    } else if (req.body.images && !Array.isArray(req.body.images)) {
      console.log('WARNING: images is not an array, converting to array');
      update.images = [req.body.images];
    } else {
      // No images field in request - preserve existing
      console.log('No images field in request - preserving existing images');
      delete update.images;
    }

    console.log('Final Update Object:', JSON.stringify(update, null, 2));
    console.log('Update Object Keys:', Object.keys(update));

    const sport = await AdventureSport.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    if (!sport) {
      console.log('ERROR: Sport not found after update');
      return res.status(404).json({
        success: false,
        message: 'Adventure sport not found'
      });
    }

    console.log('Updated Sport Images:', sport.images);
    console.log('Updated Sport Data:', JSON.stringify(sport.toObject(), null, 2));
    console.log('=== END UPDATE DEBUG ===\n');

    res.status(200).json({
      success: true,
      message: 'Adventure sport updated successfully',
      data: sport
    });
  } catch (error) {
    console.error('Update adventure sport error:', error);
    console.error('Error Stack:', error.stack);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete adventure sport (admin only)
export const deleteAdventureSport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sport = await AdventureSport.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Adventure sport not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Adventure sport deleted successfully'
    });
  } catch (error) {
    console.error('Delete adventure sport error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all adventure sports for admin
export const getAdventureSportsForAdmin = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, difficulty, isActive } = req.query;

    // Build filter object
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sports = await AdventureSport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalSports = await AdventureSport.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        sports,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalSports / Number(limit)),
          totalSports,
          hasNextPage: Number(page) < Math.ceil(totalSports / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get adventure sports for admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Upload adventure sport images
export const uploadAdventureSportImages = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const sport = await AdventureSport.findById(id);

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Adventure sport not found'
      });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Upload images to ImageKit
    const imageUrls = await uploadMultipleImages(req.files as Express.Multer.File[], {
      folder: IMAGE_FOLDERS.ADVENTURE_SPORTS,
      fileName: `sport_${id}`,
      transformation: IMAGE_TRANSFORMATIONS.ADVENTURE_SPORTS_PHOTO
    });

    // Add the new image URLs to the existing images array
    sport.images = [...(sport.images || []), ...imageUrls];
    await sport.save();

    res.status(200).json({
      success: true,
      message: 'Adventure sport images uploaded successfully',
      data: {
        sport,
        newImageUrls: imageUrls
      }
    });
  } catch (error) {
    console.error('Upload adventure sport images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload adventure sport images'
    });
  }
};